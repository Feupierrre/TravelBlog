from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController

from .routers.posts import router as posts_router
from .routers.users import router as users_router
from .routers.countries import router as countries_router

api = NinjaExtraAPI()
api.register_controllers(NinjaJWTDefaultController)

api.add_router("/posts", posts_router)
api.add_router("/", users_router)
api.add_router("/countries", countries_router)