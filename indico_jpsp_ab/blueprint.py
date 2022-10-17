from indico.core.plugins import IndicoPluginBlueprint

from indico_jpsp_ab.controllers import (RH_jpsp_home_page,
                                        RH_jpsp_connect_page,
                                        RH_jpsp_disconnect_page,
                                        RH_get_event_json,
                                        RH_get_event_files_json)


JpspAbPBlueprint = IndicoPluginBlueprint(
    'jpsp_ab', __name__,
    url_prefix='/event/<int:event_id>/manage/jpsp_ab'
)


JpspAbPBlueprint.add_url_rule(
    '/jpsp-home', 'jpsp-home', view_func=RH_jpsp_home_page)
JpspAbPBlueprint.add_url_rule('/jpsp-connect', 'jpsp-connect',
                              view_func=RH_jpsp_connect_page, methods=('GET', 'POST'))
JpspAbPBlueprint.add_url_rule('/jpsp-disconnect', 'jpsp-disconnect',
                              view_func=RH_jpsp_disconnect_page, methods=('GET', 'POST'))
JpspAbPBlueprint.add_url_rule(
    '/event-json', 'event-json', view_func=RH_get_event_json)
JpspAbPBlueprint.add_url_rule('/event-files-json', 'event-files-json',
                              view_func=RH_get_event_files_json)
