from indico.core.plugins import IndicoPluginBlueprint

from indico_purr.controllers.html.connect_page import RHPurrConnectPage
from indico_purr.controllers.html.disconnect_page import RHPurrDisconnectPage
from indico_purr.controllers.html.home_page import RHPurrHomePage
from indico_purr.controllers.html.settings_page import RHPurrSettingsPage
from indico_purr.controllers.json.abstract_booklet import RHPurrAbstractBookletJson
from indico_purr.controllers.json.final_proceedings import RHPurrFinalProceedingsJson


# from indico_purr.controllers.json.revision_check_pdf_json import RH_revision_check_pdf_json
# from indico_purr.controllers.json.event_files_json import RH_event_files_json


blueprint = IndicoPluginBlueprint('purr', __name__, url_prefix='/event/<int:event_id>/manage/purr')


blueprint.add_url_rule('/', 'purr_home', RHPurrHomePage)
blueprint.add_url_rule('/connect', 'purr_connect', RHPurrConnectPage, methods=('GET', 'POST'))
blueprint.add_url_rule('/disconnect', 'purr_disconnect', RHPurrDisconnectPage, methods=('POST',))
blueprint.add_url_rule('/settings', 'purr_settings', RHPurrSettingsPage, methods=('GET', 'POST'))

blueprint.add_url_rule('/event-abstract-booklet', 'event_abstract_booklet', RHPurrAbstractBookletJson)
blueprint.add_url_rule('/event-final-proceedings', 'event_final_proceedings', RHPurrFinalProceedingsJson)

# blueprint.add_url_rule('/event-files-json',
#                        'event-files-json',
#                        view_func=RH_event_files_json)
#
# blueprint.add_url_rule('/contributions/<int:contrib_id>/editing/<any(paper,slides,poster):type>/<int:revision_id>/check-pdf',
#                        'revision_check_pdf',
#                        view_func=RH_revision_check_pdf_json)
