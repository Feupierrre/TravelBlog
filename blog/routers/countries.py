from ninja import Router
from ninja_jwt.authentication import JWTAuth

from ..models import VisitedCountry
from ..schemas import CountrySchema

router = Router()


@router.post("", auth=JWTAuth())
def toggle_country(request, payload: CountrySchema):
    user = request.auth
    country, created = VisitedCountry.objects.get_or_create(
        user=user,
        country_code=payload.country_code
    )
    if not created:
        country.delete()
        return {"status": "removed", "code": payload.country_code}
    return {"status": "added", "code": payload.country_code}