from indico.core.plugins import IndicoPluginBlueprint

from indico_purr.controllers.html.connect_page import RHPurrConnectPage
from indico_purr.controllers.html.disconnect_page import RHPurrDisconnectPage
from indico_purr.controllers.html.home_page import RHPurrHomePage
from indico_purr.controllers.html.settings_page import RHPurrSettingsPage
from indico_purr.controllers.json.abstract_booklet import RHPurrAbstractBookletJson
from indico_purr.controllers.json.final_proceedings import RHPurrFinalProceedingsJson


# from indico_purr.controllers.json.revision_check_pdf_json import RH_revision_check_pdf_json

# from indico_purr.controllers.json.event_files_json import RH_event_files_json


PurrPluginBlueprint = IndicoPluginBlueprint(
    'purr',
    __name__,
    url_prefix='/event/<int:event_id>/manage/purr'
)


PurrPluginBlueprint.add_url_rule('/purr-home',
                                 'purr-home',
                                 view_func=RHPurrHomePage)

PurrPluginBlueprint.add_url_rule('/purr-connect',
                                 'purr-connect',
                                 view_func=RHPurrConnectPage,
                                 methods=('GET', 'POST'))

PurrPluginBlueprint.add_url_rule('/purr-disconnect',
                                 'purr-disconnect',
                                 view_func=RHPurrDisconnectPage,
                                 methods=('GET', 'POST'))

PurrPluginBlueprint.add_url_rule('/purr-settings',
                                 'purr-settings',
                                 view_func=RHPurrSettingsPage,
                                 methods=('GET', 'POST'))


PurrPluginBlueprint.add_url_rule('/event-abstract-booklet',
                                 'event-abstract-booklet',
                                 view_func=RHPurrAbstractBookletJson)

PurrPluginBlueprint.add_url_rule('/event-final-proceedings',
                                 'event-final-proceedings',
                                 view_func=RHPurrFinalProceedingsJson)

# PurrPluginBlueprint.add_url_rule('/event-files-json',
#                                  'event-files-json',
#                                  view_func=RH_event_files_json)
#
# PurrPluginBlueprint.add_url_rule('/contributions/<int:contrib_id>/editing/<any(paper,slides,poster):type>/<int:revision_id>/check-pdf',
#                                  'revision_check_pdf',
#                                  view_func=RH_revision_check_pdf_json)
