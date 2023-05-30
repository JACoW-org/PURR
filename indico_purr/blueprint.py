from indico_purr.controllers.json.abstract_booklet.sessions_data \
    import RHPurrSessionsDataJson
from indico_purr.controllers.json.abstract_booklet.contributions_data \
    import RHPurrAbstractBookletContributionsDataJson
from indico_purr.controllers.json.abstract_booklet \
    import RHPurrAbstractBookletJson

from indico_purr.controllers.json.common.event_data \
    import RHPurrSettingsAndEventDataJson
from indico_purr.controllers.json.common.settings_data \
    import RHPurrSettingsDataJson
from indico_purr.controllers.json.common.connect_data \
    import RHPurrConnectDataJson
from indico_purr.controllers.json.common.disconnect_data \
    import RHPurrDisconnectDataJson

from indico_purr.controllers.json.final_proceedings.attachments_data \
    import RHPurrAttachmentsDataJson
from indico_purr.controllers.json.final_proceedings.sessions_data \
    import RHPurrSessionsDataJson
from indico_purr.controllers.json.final_proceedings.contributions_data \
    import RHPurrFinalProceedingsContributionsDataJson
from indico_purr.controllers.json.final_proceedings \
    import RHPurrFinalProceedingsJson

from indico_purr.controllers.html.home_page import RHPurrHomePage

from indico.core.plugins import IndicoPluginBlueprint


blueprint = IndicoPluginBlueprint(
    "purr", __name__,
    url_prefix="/event/<int:event_id>/manage/purr"
)

# region PAGES
blueprint.add_url_rule(
    "/",
    "purr_home",
    RHPurrHomePage,
    methods=("GET",)
)
# endregion

# region SETTINGS
blueprint.add_url_rule(
    "/connect",
    "purr_connect",
    RHPurrConnectDataJson,
    methods=("POST",)
)

blueprint.add_url_rule(
    "/disconnect",
    "purr_disconnect",
    RHPurrDisconnectDataJson,
    methods=("POST",)
)

blueprint.add_url_rule(
    "/settings-data",
    "purr_settings_data",
    RHPurrSettingsDataJson,
    methods=("GET", "POST")
)

blueprint.add_url_rule(
    "/settings-and-event-data",
    "event_data",
    RHPurrSettingsAndEventDataJson,
    methods=("GET",)
)
# endregion

# region ABSTRACT_BOOKLET
blueprint.add_url_rule(
    "/event-abstract-booklet",
    "event_abstract_booklet",
    RHPurrAbstractBookletJson
)

blueprint.add_url_rule(
    "/abstract-booklet-contributions-data/<session_block_id>",
    "abstract_booklet_contributions_data",
    RHPurrAbstractBookletContributionsDataJson,
)

blueprint.add_url_rule(
    "/abstract-booklet-sessions-data",
    "abstract_booklet_sessions_data",
    RHPurrSessionsDataJson,
)
# endregion

# region FINAL_PROCEEDINGS
blueprint.add_url_rule(
    "/event-final-proceedings",
    "event_final_proceedings",
    RHPurrFinalProceedingsJson
)

blueprint.add_url_rule(
    "/final-proceedings-contributions-data/<session_block_id>",
    "final_proceedings_contributions_data",
    RHPurrFinalProceedingsContributionsDataJson,
)

blueprint.add_url_rule(
    "/final-proceedings-sessions-data",
    "final_proceedings_sessions_data",
    RHPurrSessionsDataJson,
)

blueprint.add_url_rule(
    "/final-proceedings-attachments-data",
    "final_proceedings_attachments_data",
    RHPurrAttachmentsDataJson,
)
# endregion
