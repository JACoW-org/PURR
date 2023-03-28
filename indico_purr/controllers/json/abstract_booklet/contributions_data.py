from flask import jsonify, request
from werkzeug.exceptions import BadRequest

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.services.abstract_booklet_exporter import PurrAbstractBookletExporter
from indico_purr.utils import get_purr_settings


class RHPurrContributionsDataJson(RHManageEventBase, PurrAbstractBookletExporter):
    def _process(self):
        session_block_id = request.view_args["session_block_id"]

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
