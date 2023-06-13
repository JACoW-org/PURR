from flask import session, jsonify, request

from indico.modules.events.management.controllers.base import RHManageEventBase
from indico.modules.logs import EventLogRealm, LogKind

# from indico.web.util import jsonify_data, jsonify_form
# from flask_pluginengine import current_plugin

from indico_purr import _
# from indico_purr.forms import PurrConnectForm
from indico_purr.utils import get_purr_settings, set_purr_settings

from indico_purr.models.connection import PurrConnection
from indico_purr.models.settings import PurrSettings


class RHPurrConnectDataJson(RHManageEventBase):
    def _process(self):

        # current_plugin.logger.info(request.json)

        connection = PurrConnection(**request.json.get("connection"))

        errors = connection.validate()
        if errors:
            return jsonify({
                "connection_ok": False,
                "errors": errors
            })

        set_purr_settings(self.event, **connection.as_dict(), connected=True)

        self.event.log(
            EventLogRealm.management,
            LogKind.change,
            "PURR",
            "Updated",
            session.user,
        )

        settings = get_purr_settings(self.event)
        purr_settings = PurrSettings(
            ab_session_h1=settings.get("ab_session_h1"),
            ab_session_h2=settings.get("ab_session_h2"),
            ab_contribution_h1=settings.get("ab_contribution_h1"),
            ab_contribution_h2=settings.get("ab_contribution_h2"),
            custom_fields=settings.get("custom_fields"),
            pdf_page_height=settings.get("pdf_page_height"),
            pdf_page_width=settings.get("pdf_page_width"),
            date=settings.get("date"),
            isbn=settings.get("isbn"),
            issn=settings.get("date"),
            booktitle_short=settings.get("booktitle_short"),
            booktitle_long=settings.get("booktitle_long"),
            series=settings.get("series"),
            series_number=settings.get("series_number"),
            pre_print=settings.get("pre_print"),
            location=settings.get("location"),
            host_info=settings.get("host_info"),
            editorial_board=settings.get("editorial_board"),
            editorial_json=settings.get("editorial_json"),
            doi_protocol=settings.get("doi_protocol"),
            doi_domain=settings.get("doi_domain"),
            doi_context=settings.get("doi_context"),
            doi_organization=settings.get("doi_organization"),
            doi_conference=settings.get("doi_conference"),
            doi_user=settings.get("doi_user"),
            doi_password=settings.get("doi_password"),
            primary_color=settings.get("primary_color"),
        )

        errors = purr_settings.validate()

        return jsonify({
            "settings": settings,
            "connection_ok": True,
            "settings_valid": False if errors else True,
        })
