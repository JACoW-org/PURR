from indico_purr.services.exporter.abstract_event_exporter import ABCExportEvent


class PurrFinalProceedingsExporter(ABCExportEvent):
    """ """

    def _export_event_contributions_data(self, event, session_block_id):
        contributions = self.find_contributions_list(
            event=event, session_block_id=session_block_id, files=True
        )

        contributions_data = [
            self._serialize_contribution(event, c) for c in contributions
        ]

        return contributions_data

    def _export_event_attachments_data(self, event):
        attachments_data = []

        attachments = self.find_attachments_list(event)

        for attachment in attachments:
            attachments_data.append(
                dict(
                    id=attachment.id,
                    md5sum=attachment.file.md5,
                    filename=attachment.file.filename,
                    content_type=attachment.file.content_type,
                    size=attachment.file.size,
                    title=attachment.title,
                    description=attachment.description,
                    external_download_url=attachment.absolute_download_url,
                )
            )

        return attachments_data

    def _build_event_api_data(self, event):
        data = self._build_event_api_data_base(event)

        attachments = self.find_attachments_list(event=event)

        data["attachments"] = []

        for attachment in attachments:
            data["attachments"].append(
                dict(
                    md5sum=attachment.file.md5,
                    filename=attachment.file.filename,
                    content_type=attachment.file.content_type,
                    size=attachment.file.size,
                    title=attachment.title,
                    description=attachment.description,
                    external_download_url=attachment.absolute_download_url,
                )
            )

        contributions = self.find_contributions_list(
            event=event, session_block_id=None, files=True
        )

        data["contributions"] = []

        for contribution in contributions:
            serialized_contrib = self._serialize_contribution(
                event, contribution)
            data["contributions"].append(serialized_contrib)

        data["sessions"] = []

        for session in event.sessions:
            serialized = self._serialize_session(session)
            serialized_sessions = [
                self._serialize_session_block(event, block, serialized)
                for block in session.blocks
            ]

            data["sessions"].extend(serialized_sessions)

        # current_plugin.logger.debug(f'[delta] sessions -> {(datetime.now().timestamp() - start_date)}')

        # if occurrences:
        #
        #     # start_date = datetime.now().timestamp()
        #
        #     data['occurrences'] = self._serialize_event_occurrences(event)
        #
        #     # current_plugin.logger.debug(f'[delta] occurrences -> {(datetime.now().timestamp() - start_date)}')

        return data
