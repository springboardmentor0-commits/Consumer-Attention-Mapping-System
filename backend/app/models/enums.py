import enum


class RoleEnum(str, enum.Enum):
    ADMIN = "administrator"
    STORE_MANAGER = "store_manager"
    RETAIL_ANALYST = "retail_analyst"
    MARKETING_MANAGER = "marketing_manager"


class CameraTypeEnum(str, enum.Enum):
    IP_CCTV = "ip_cctv"
    DEPTH = "depth"


class CameraStatusEnum(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"
