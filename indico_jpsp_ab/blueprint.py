from indico_jpsp_ab.controllers import RH_get_ab_page, RH_get_event_json
from indico.core.plugins import IndicoPluginBlueprint


IndicoJpspAbPBlueprint = IndicoPluginBlueprint(
    'jpsp_ab', __name__,
    url_prefix='/event/<int:event_id>/manage/jpsp_ab'
)


IndicoJpspAbPBlueprint.add_url_rule('/get-ab', 'get-ab', view_func=RH_get_ab_page)
IndicoJpspAbPBlueprint.add_url_rule('/event-json', 'event-json', view_func=RH_get_event_json)

