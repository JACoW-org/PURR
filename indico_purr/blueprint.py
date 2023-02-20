from indico.core.plugins import IndicoPluginBlueprint

from indico_purr.controllers.html.home_page import RH_home_page
from indico_purr.controllers.html.connect_page import RH_connect_page
from indico_purr.controllers.html.disconnect_page import RH_disconnect_page
from indico_purr.controllers.html.settings_page import RH_settings_page
# from indico_purr.controllers.json.revision_check_pdf_json import RH_revision_check_pdf_json

from indico_purr.controllers.json.abstract_booklet import RH_abstract_booklet_json
from indico_purr.controllers.json.final_proceedings import RH_final_proceedings_json
# from indico_purr.controllers.json.event_files_json import RH_event_files_json


PurrPluginBlueprint = IndicoPluginBlueprint(
    'purr',
    __name__,
    url_prefix='/event/<int:event_id>/manage/purr'
)


PurrPluginBlueprint.add_url_rule('/purr-home',
                                 'purr-home',
                                 view_func=RH_home_page)

PurrPluginBlueprint.add_url_rule('/purr-connect',
                                 'purr-connect',
                                 view_func=RH_connect_page,
                                 methods=('GET', 'POST'))

PurrPluginBlueprint.add_url_rule('/purr-disconnect',
                                 'purr-disconnect',
                                 view_func=RH_disconnect_page,
                                 methods=('GET', 'POST'))

PurrPluginBlueprint.add_url_rule('/purr-settings',
                                 'purr-settings',
                                 view_func=RH_settings_page,
                                 methods=('GET', 'POST'))


PurrPluginBlueprint.add_url_rule('/event-abstract-booklet',
                                 'event-abstract-booklet',
                                 view_func=RH_abstract_booklet_json)

PurrPluginBlueprint.add_url_rule('/event-final-proceedings',
                                 'event-final-proceedings',
                                 view_func=RH_final_proceedings_json)

# PurrPluginBlueprint.add_url_rule('/event-files-json',
#                                  'event-files-json',
#                                  view_func=RH_event_files_json)
# 
# PurrPluginBlueprint.add_url_rule('/contributions/<int:contrib_id>/editing/<any(paper,slides,poster):type>/<int:revision_id>/check-pdf',
#                                  'revision_check_pdf',
#                                  view_func=RH_revision_check_pdf_json)
