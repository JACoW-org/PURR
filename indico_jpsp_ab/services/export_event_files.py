from abc import ABC

from sqlalchemy.orm import joinedload

from indico.modules.events.contributions.models.contributions import Contribution
from indico.modules.events.editing.models.editable import Editable

from indico.modules.events.editing.models.revision_files import EditingRevisionFile
from indico.modules.events.editing.models.revisions import EditingRevision, InitialRevisionState

from indico.web.flask.util import url_for


class ABCExportEventFiles(ABC):
    """ """

    def _build_event_files_api_data(self, event):

        contributions = (Contribution.query
                         .with_parent(event)
                         .options(joinedload('editables'))
                         .order_by(Contribution.friendly_id)
                         .all())

        elements = [self._serialize_contribution(
            event, contribution) for contribution in contributions]

        return [el for el in elements if el.get('revisions', None) is not None]

    def _serialize_contribution(self, event, contribution):
        
        editable = self._serialize_editable(event, contribution);
        
        return {
            "id": contribution.id,
            "code": contribution.code,
            "title": contribution.title,
            "friendly_id": contribution.friendly_id,
            "revisions":  editable.get('revisions', None) if editable else None
        }

    def _serialize_editable(self, event, contribution):

        editable = (Editable.query
                    .with_parent(contribution)
                    .filter_by(type=1)
                    .first())

        if editable is not None:
            
            elements = [
                self._serialize_editable_revision(event, contribution, revision)
                for revision in editable.revisions
            ]
            
            return {
                "id": editable.id,
                "type": editable.type,
                # "revision": self._serialize_editable_revision(event, contribution, editable.revisions[-1]),
                "revisions": [el for el in elements if len(el.get('files', [])) > 0]
            }

        return None

    def _serialize_editable_revision(self, event, contribution, revision):

        files = EditingRevisionFile.query.with_parent(revision).all()

        return {
            "id": revision.id,
            "comment": revision.comment,
            "created_dt": revision.created_dt,
            "files": [
                self._serialize_file(event, contribution, revision, f.file)
                for f in files if f.file.content_type == "application/pdf"
            ]
        }

    def _serialize_file(self, event, contribution, revision, file):
        # print(file)

        # content_type: "application/pdf"
        # contribution_id: 2591
        # event_id: 12
        # filename: "WEP60.pdf"
        # id: 16664
        # revision_id: 5949
        # url: "http://127.0.0.1:8005/event/12/contributions/2591/editing/paper/5949/16664/WEP60.pdf"

        download_url = f"/event/{event.id}/contributions/{contribution.id}/editing/paper/{revision.id}/{file.id}/{file.filename}"

        return {
            "id": file.id,
            "uuid": file.uuid,
            "filename": file.filename,
            "content_type": file.content_type,
            "event_id": event.id,
            "contribution_id": contribution.id,
            "revision_id": revision.id,
            "download_url": download_url

            # "download_url": url_for('.download_archive', event, type="paper", uuid=file.uuid) # archive_type=archive_type,
            # "external_download_url": url_for('attachments.download', filename=file.filename, _external=True)
        }
