from indico.core.plugins import IndicoPluginBlueprint

from indico_jpsp_ab.controllers.html.home_page import RH_home_page
from indico_jpsp_ab.controllers.html.connect_page import RH_connect_page
from indico_jpsp_ab.controllers.html.disconnect_page import RH_disconnect_page
from indico_jpsp_ab.controllers.html.settings_page import RH_settings_page

from indico_jpsp_ab.controllers.json.event_json import RH_event_json
from indico_jpsp_ab.controllers.json.event_files_json import RH_event_files_json
from indico_jpsp_ab.controllers.json.revision_check_pdf_json import RH_revision_check_pdf_json




JpspAbPBlueprint = IndicoPluginBlueprint(
    'jpsp_ab',
    __name__,
    url_prefix=f'/event/<int:event_id>/manage/jpsp_ab'
)


JpspAbPBlueprint.add_url_rule('/jpsp-home',
                              'jpsp-home',
                              view_func=RH_home_page)

JpspAbPBlueprint.add_url_rule('/jpsp-connect',
                              'jpsp-connect',
                              view_func=RH_connect_page,
                              methods=('GET', 'POST'))

JpspAbPBlueprint.add_url_rule('/jpsp-disconnect',
                              'jpsp-disconnect',
                              view_func=RH_disconnect_page,
                              methods=('GET', 'POST'))

JpspAbPBlueprint.add_url_rule('/jpsp-settings',
                              'jpsp-settings',
                              view_func=RH_settings_page,
                              methods=('GET', 'POST'))


JpspAbPBlueprint.add_url_rule('/event-json',
                              'event-json',
                              view_func=RH_event_json)

JpspAbPBlueprint.add_url_rule('/event-files-json',
                              'event-files-json',
                              view_func=RH_event_files_json)

JpspAbPBlueprint.add_url_rule('/contributions/<int:contrib_id>/editing/<any(paper,slides,poster):type>/<int:revision_id>/check-pdf',
                              'revision_check_pdf',
                              view_func=RH_revision_check_pdf_json)
