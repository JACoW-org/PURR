from flask_pluginengine import current_plugin

from indico_purr.services.exporter.abstract_event_exporter import ABCExportEvent


class PurrFinalProceedingsExporter(ABCExportEvent):
    """ """

    def _build_event_api_data(self, event):

        # start_date = datetime.now().timestamp()

        data = self._build_event_api_data_base(event)

        # current_plugin.logger.debug(f'[delta] event -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()

        # material_data = build_material_legacy_api_data__wrapper(event)

        # current_plugin.logger.debug(f'[delta] material_data -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()

        # if legacy_note_material := build_note_legacy_api_data__wrapper(event.note):
        #     if material_data is not None:
        #         material_data.append(legacy_note_material)
        #     else:
        #         current_plugin.logger.error('Error: material_data is None')

        # current_plugin.logger.debug(f'[delta] material_legacy ->: {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()

        # if contributions:
        #
        #     data['contributions'] = []
        #
        #     for contribution in event.contributions:
        #         serialized_contrib = self._serialize_contribution(event, contribution)
        #         data['contributions'].append(serialized_contrib)
        #
        #     # current_plugin.logger.debug(f'[delta] contributions -> {(datetime.now().timestamp() - start_date)}')

        attachments = self.find_attachments_list(event=event)

        data['attachments'] = []

        for attachment in attachments:
            data['attachments'].append(dict(
                md5sum=attachment.file.md5,
                filename=attachment.file.filename,
                content_type=attachment.file.content_type,
                size=attachment.file.size,

                title=attachment.title,
                description=attachment.description,
                external_download_url=attachment.absolute_download_url,
            ))

        contributions = self.find_contributions_list(event=event, files=True)

        data['contributions'] = []

        for contribution in contributions:
            serialized_contrib = self._serialize_contribution(
                event, contribution)
            data['contributions'].append(serialized_contrib)

        # start_date = datetime.now().timestamp()

        data['sessions'] = []

        for session in event.sessions:

            serialized = self._serialize_session(session)
            serialized_sessions = [
                self._serialize_session_block(event, block, serialized)
                for block in session.blocks
            ]

            data['sessions'].extend(serialized_sessions)


        # current_plugin.logger.debug(f'[delta] sessions -> {(datetime.now().timestamp() - start_date)}')

        # if occurrences:
        #
        #     # start_date = datetime.now().timestamp()
        #
        #     data['occurrences'] = self._serialize_event_occurrences(event)
        #
        #     # current_plugin.logger.debug(f'[delta] occurrences -> {(datetime.now().timestamp() - start_date)}')

        return data
