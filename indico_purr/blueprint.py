from indico.core.plugins import IndicoPluginBlueprint

blueprint = IndicoPluginBlueprint(
    "purr", __name__, url_prefix="/event/<int:event_id>/manage/purr"
)

from indico_purr.controllers.html.home_page import RHPurrHomePage

blueprint.add_url_rule("/", "purr_home", RHPurrHomePage)

from indico_purr.controllers.html.connect_page import RHPurrConnectPage

blueprint.add_url_rule(
    "/connect", "purr_connect", RHPurrConnectPage, methods=("GET", "POST")
)

from indico_purr.controllers.html.disconnect_page import RHPurrDisconnectPage

blueprint.add_url_rule(
    "/disconnect", "purr_disconnect", RHPurrDisconnectPage, methods=("POST",)
)

from indico_purr.controllers.html.settings_page import RHPurrSettingsPage

blueprint.add_url_rule(
    "/settings", "purr_settings", RHPurrSettingsPage, methods=("GET", "POST")
)

from indico_purr.controllers.json.common.settings_data import RHPurrSettingsDataJson

blueprint.add_url_rule(
    "/settings-data", "purr_settings_data", RHPurrSettingsDataJson, methods=("GET", "POST")
)

from indico_purr.controllers.json.abstract_booklet import RHPurrAbstractBookletJson

blueprint.add_url_rule(
    "/event-abstract-booklet", "event_abstract_booklet", RHPurrAbstractBookletJson
)

from indico_purr.controllers.json.final_proceedings import RHPurrFinalProceedingsJson

blueprint.add_url_rule(
    "/event-final-proceedings", "event_final_proceedings", RHPurrFinalProceedingsJson
)

from indico_purr.controllers.json.common.event_data import (
    RHPurrSettingsAndEventDataJson,
)

blueprint.add_url_rule(
    "/settings-and-event-data", "event_data", RHPurrSettingsAndEventDataJson
)

from indico_purr.controllers.json.abstract_booklet.contributions_data import (
    RHPurrContributionsDataJson,
)

blueprint.add_url_rule(
    "/abstract-booklet-contributions-data/<session_block_id>",
    "abstract_booklet_contributions_data",
    RHPurrContributionsDataJson,
)

from indico_purr.controllers.json.abstract_booklet.sessions_data import (
    RHPurrSessionsDataJson,
)

blueprint.add_url_rule(
    "/abstract-booklet-sessions-data",
    "abstract_booklet_sessions_data",
    RHPurrSessionsDataJson,
)


from indico_purr.controllers.json.final_proceedings.contributions_data import (
    RHPurrContributionsDataJson,
)

blueprint.add_url_rule(
    "/final-proceedings-contributions-data/<session_block_id>",
    "final_proceedings_contributions_data",
    RHPurrContributionsDataJson,
)

from indico_purr.controllers.json.final_proceedings.sessions_data import (
    RHPurrSessionsDataJson,
)

blueprint.add_url_rule(
    "/final-proceedings-sessions-data",
    "final_proceedings_sessions_data",
    RHPurrSessionsDataJson,
)

from indico_purr.controllers.json.final_proceedings.attachments_data import (
    RHPurrAttachmentsDataJson,
)

blueprint.add_url_rule(
    "/final-proceedings-attachments-data",
    "final_proceedings_attachments_data",
    RHPurrAttachmentsDataJson,
)
