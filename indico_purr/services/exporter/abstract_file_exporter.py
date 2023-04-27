from abc import ABC

from indico.modules.events.editing.models.revision_files import EditingRevisionFile


class ABCExportFile(ABC):
    """ """

    def _get_files(self, event, contribution, revision):
        return [
            self._serialize_file(event, contribution, revision, erf)
            for erf in EditingRevisionFile.query.with_parent(revision)
            if erf.file_type.name == "PDF" and erf.file_type.type in [1, 2, 3]
        ]

    def _get_tags(self, revision):
        return [
            {
                "title": tag.title,
                "code": tag.code,
                "color": tag.color,
                "system": tag.system,
            }
            for tag in revision.tags
        ]

    def _serialize_editable_revision(
        self, event, contribution, revision, include_files
    ):
        revision_files = (
            self._get_files(event, contribution, revision) if include_files else []
        )

        revision_tags = self._get_tags(revision)

        return {
            "id": revision.id,
            "comment": revision.comment,
            "created_dt": revision.created_dt,
            "reviewed_dt": revision.reviewed_dt,
            "initial_state": revision.initial_state,
            "final_state": revision.final_state,
            "files": revision_files,
            "tags": revision_tags,
        }

    def _serialize_file(self, event, contribution, revision, editing_revision_file):
        # print(editing_revision_file)

        rev_file = editing_revision_file.file
        file_type = editing_revision_file.file_type

        # content_type: "application/pdf"
        # contribution_id: 2591
        # event_id: 12
        # filename: "WEP60.pdf"
        # id: 16664
        # revision_id: 5949
        # url: "http://127.0.0.1:8005/event/12/contributions/2591/editing/paper/5949/16664/WEP60.pdf"

        download_url = editing_revision_file.download_url
        external_download_url = editing_revision_file.external_download_url

        return {
            "id": rev_file.id,
            "uuid": str(rev_file.uuid),
            "md5sum": rev_file.md5,
            "filename": rev_file.filename,
            "content_type": rev_file.content_type,
            "file_type": {
                "type": file_type.type,
                "name": file_type.name,
                "extensions": file_type.extensions,
                "required": file_type.required,
                "publishable": file_type.publishable,
                "filename_template": file_type.filename_template,
            },
            "event_id": event.id,
            "contribution_id": contribution.id,
            "revision_id": revision.id,
            "download_url": download_url,
            "external_download_url": external_download_url,
        }
