from flask import jsonify
from werkzeug.exceptions import BadRequest

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.services.final_proceedings_exporter import PurrFinalProceedingsExporter
from indico_purr.utils import get_purr_settings


class RHPurrAttachmentsDataJson(RHManageEventBase, PurrFinalProceedingsExporter):
    def _process(self):
        settings = get_purr_settings(self.event)
        if not settings["connected"]:
            raise BadRequest

        return jsonify(
            {
                "attachments": self._export_event_attachments_data(self.event)
            }
        )
