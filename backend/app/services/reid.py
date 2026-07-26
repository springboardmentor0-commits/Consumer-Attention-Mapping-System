import cv2
import torch
import torchreid
from PIL import Image
from torchvision import transforms
from torch.nn.functional import cosine_similarity


class ReIDManager:

    def __init__(self, similarity_threshold=0.80):

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.model = torchreid.models.build_model(
            name="osnet_x0_25", num_classes=1000, pretrained=True
        )

        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose(
            [
                transforms.Resize((128, 64)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
                ),
            ]
        )

        # Stable shopper IDs
        self.next_global_id = 1

        # ByteTrack ID -> Global ID
        self.byte_to_global = {}

        # Global ID -> list of embeddings
        self.saved_embeddings = {}

        self.threshold = similarity_threshold

    # -------------------------------------------------

    def extract_embedding(self, image):

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        pil = Image.fromarray(rgb)

        tensor = self.transform(pil).unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.model(tensor)

        embedding = embedding.squeeze()

        embedding = embedding / embedding.norm()

        return embedding

    # -------------------------------------------------

    def compare_embeddings(self, embedding):

        best_global_id = None
        best_score = -1

        for global_id, embeddings in self.saved_embeddings.items():

            highest_score = -1

            for stored_embedding in embeddings:

                score = cosine_similarity(
                    embedding.unsqueeze(0), stored_embedding.unsqueeze(0)
                ).item()

                highest_score = max(highest_score, score)

            if highest_score > best_score:
                best_score = highest_score
                best_global_id = global_id

        return best_global_id, best_score

    # -------------------------------------------------

    def get_global_id(self, bytetrack_id, person_crop):

        if person_crop.size == 0:
            return bytetrack_id

        # Existing ByteTrack mapping
        if bytetrack_id in self.byte_to_global:

            global_id = self.byte_to_global[bytetrack_id]

            embedding = self.extract_embedding(person_crop)

            self.saved_embeddings[global_id].append(embedding)

            if len(self.saved_embeddings[global_id]) > 5:
                self.saved_embeddings[global_id].pop(0)

            return global_id

        embedding = self.extract_embedding(person_crop)

        matched_id, score = self.compare_embeddings(embedding)

        # Existing shopper found
        if matched_id is not None and score >= self.threshold:

            self.byte_to_global[bytetrack_id] = matched_id

            self.saved_embeddings[matched_id].append(embedding)

            if len(self.saved_embeddings[matched_id]) > 5:
                self.saved_embeddings[matched_id].pop(0)

            return matched_id

        # New shopper
        global_id = self.next_global_id
        self.next_global_id += 1

        self.byte_to_global[bytetrack_id] = global_id
        self.saved_embeddings[global_id] = [embedding]

        return global_id

    # -------------------------------------------------

    def remove_bytetrack_id(self, bytetrack_id):

        if bytetrack_id in self.byte_to_global:
            del self.byte_to_global[bytetrack_id]

    # -------------------------------------------------

    def clear(self):

        self.byte_to_global.clear()
