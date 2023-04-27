from flask import jsonify, request
from werkzeug.exceptions import BadRequest

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.services.final_proceedings_exporter import PurrFinalProceedingsExporter
from indico_purr.utils import get_purr_settings


class RHPurrContributionsDataJson(RHManageEventBase, PurrFinalProceedingsExporter):
    def _process(self):
        session_block_id = int(request.view_args["session_block_id"])
        settings = get_purr_settings(self.event)
        if not settings["connected"]:
            raise BadRequest

        return jsonify(
            {
                "contributions": self._export_event_contributions_data(
                    self.event, session_block_id
                )
            }
        )
