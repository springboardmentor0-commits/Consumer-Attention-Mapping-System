import torch
import torchreid
import cv2
import numpy as np
from torchvision import transforms
from PIL import Image
from torch.nn.functional import cosine_similarity


class ReIDManager:
    def __init__(self, similarity_threshold=0.75):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.model = torchreid.models.build_model(
            name="osnet_x0_25",
            num_classes=1000,
            pretrained=True
        )

        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((256, 128)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        self.saved_embeddings = {}
        self.next_global_id = 1
        self.byte_to_global = {}

        self.threshold = similarity_threshold

    def extract_embedding(self, image):
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil = Image.fromarray(rgb)

        tensor = self.transform(pil).unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.model(tensor)

        return embedding.squeeze()

    def get_global_id(self, bytetrack_id, person_crop):
        if bytetrack_id in self.byte_to_global:
            return self.byte_to_global[bytetrack_id]

        embedding = self.extract_embedding(person_crop)

        best_id = None
        best_score = -1

        for global_id, stored_embedding in self.saved_embeddings.items():

            score = cosine_similarity(
                embedding.unsqueeze(0),
                stored_embedding.unsqueeze(0)
            ).item()

            if score > best_score:
                best_score = score
                best_id = global_id

        if best_score >= self.threshold:
            self.byte_to_global[bytetrack_id] = best_id
            return best_id

        global_id = self.next_global_id
        self.next_global_id += 1

        self.saved_embeddings[global_id] = embedding
        self.byte_to_global[bytetrack_id] = global_id

        return global_id