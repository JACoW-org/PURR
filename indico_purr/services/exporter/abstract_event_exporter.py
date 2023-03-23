from abc import ABC

from datetime import datetime
from operator import attrgetter
from sqlalchemy import Date, cast
from sqlalchemy.orm import joinedload

from flask_pluginengine import current_plugin

from indico.util.date_time import iterdays
from indico.web.flask.util import url_for

from indico.modules.events.editing.models.editable import Editable
from indico.modules.events.timetable.models.entries import TimetableEntry
from indico.modules.events.contributions.models.contributions import Contribution
from indico.modules.attachments.models.attachments import Attachment
from indico.modules.attachments.models.folders import AttachmentFolder


from indico_purr.services.exporter.abstract_file_exporter import ABCExportFile
from indico_purr.services.exporter.common_exporter_utils import export_serialize_date, export_serialize_reference

from indico_purr.utils import DEFAULT_TIMEZONE

# from indico_purr.wrappers import build_folders_api_data__wrapper, \
#     build_material_legacy_api_data__wrapper, build_note_api_data__wrapper, \
#     build_note_legacy_api_data__wrapper


class ABCExportEvent(ABCExportFile):
    """ """

    # _detail_level = 'sessions'

    # _fossils_mapping = {
    #     'event': {
    #         'events': 'conferenceMetadata',
    #         'contributions': 'conferenceMetadataWithContribs',
    #         'subcontributions': 'conferenceMetadataWithSubContribs',
    #         'sessions': 'conferenceMetadataWithSessions'
    #     },
    #     'contribution': {
    #         'contributions': 'contributionMetadata',
    #         'subcontributions': 'contributionMetadataWithSubContribs',
    #         'sessions': 'contributionMetadataWithSubContribs'
    #     },
    #     'block': {
    #         'sessions': 'sessionMetadata',
    #         'contributions': 'sessionMetadataWithContributions'
    #     },
    #     'person': {
    #         'Avatar': 'conferenceChairMetadata',
    #         'ConferenceChair': 'conferenceChairMetadata',
    #         'ContributionParticipation': 'contributionParticipationMetadata',
    #         'SubContribParticipation': 'contributionParticipationMetadata'
    #     }
    # }

    def find_attachments_list(self, event):
        # query = Attachment.query.with_parent(event)

        # current_plugin.logger.info('files ' + str(files))

        event_folders = AttachmentFolder.query.filter_by(event=event, is_deleted=False).all()

        folder_ids = [f.id for f in event_folders if f.title == 'final_proceedings']

        event_attachments = Attachment.query.filter(
            Attachment.is_deleted==False,
            Attachment.folder_id.in_(folder_ids)
        ).all()

        # event_attachments = query.filter_by(is_deleted=False).order_by(Attachment.title).all()
        return event_attachments

    def find_contributions_list(self, event, files):
        query = Contribution.query.with_parent(event)

        # current_plugin.logger.info('files ' + str(files))

        if files == True:
            query.options(joinedload('editables'))

        event_contributions = query.filter_by(is_deleted=False).order_by(Contribution.friendly_id).all()
        return event_contributions

    def find_event_day_bounds(self, obj, day):
        if not (obj.start_dt_local.date() <= day <= obj.end_dt_local.date()):
            return None, None
        entries = obj.timetable_entries.filter(TimetableEntry.parent_id.is_(None),
                                               cast(TimetableEntry.start_dt.astimezone(obj.tzinfo), Date) == day).all()
        first = min(entries, key=attrgetter('start_dt')
                    ).start_dt if entries else None
        last = max(entries, key=attrgetter('end_dt')
                   ).end_dt if entries else None
        return first, last

    def _build_event_api_data_base(self, event):
        return {
            # '_type': 'Conference',
            'id': str(event.id),
            'title': event.title,
            'description': event.description,
            # 'note': build_note_api_data__wrapper(event.note),
            'start_dt': export_serialize_date(event.start_dt),
            'end_dt': export_serialize_date(event.end_dt),
            'timezone': event.timezone,
            'room': event.get_room_name(full=False),
            'location': event.venue_name,
            'address': event.address,
            # 'category_id': event.category_id,
            'category': event.category.title,
            'room_name': event.room_name,
            'url': event.external_url,
            'creation_dt': export_serialize_date(event.created_dt),
            'creator': self._serialize_person(event.creator),
            # 'hasAnyProtection': event.effective_protection_mode != ProtectionMode.public,
            # 'room_map_url': event.room.map_url if event.room else None,
            # 'folders': build_folders_api_data__wrapper(event),
            'chairs': self._serialize_persons(event.person_links),
            # 'material': material_data,
            'keywords': event.keywords,
            'organizer': event.organizer_info,
            'references': list(map(export_serialize_reference, event.references))
        }

    def _serialize_person_affiliation(self, person):
        return {
            'name': person.affiliation
        } if person else None

    def _serialize_person(self, person):
        return {
            # '_type': person_type,
            # '_fossil': self._fossils_mapping['person'].get(person_type, None),
            'first_name': person.first_name,
            'last_name': person.last_name,
            'id': str(person.id),
            'affiliation': person.affiliation,
            'email': person.email
        } if person else None

    def _serialize_institutes(self, persons):
        return [self._serialize_person_affiliation(person) for person in persons]

    def _serialize_persons(self, persons):
        return [self._serialize_person(person) for person in persons]

    def _serialize_field_value(self, field):
        return {
            'name': field.contribution_field.title,
            'value': field.friendly_data
        }

    def _serialize_contribution(self, event, contrib):

        # start_date = datetime.now().timestamp()

        # folders = build_folders_api_data__wrapper(contrib)
        #
        # # current_plugin.logger.error(f'[delta] folders -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()
        #
        # material = build_material_legacy_api_data__wrapper(contrib)
        #
        # # current_plugin.logger.error(f'[delta] material -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()

        institutes = self._serialize_institutes(contrib.primary_authors)

        speakers = self._serialize_persons(contrib.speakers)

        # current_plugin.logger.debug(f'[delta] speakers -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()

        primary_authors = self._serialize_persons(contrib.primary_authors)

        # current_plugin.logger.debug(f'[delta] primary_authors -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()

        coauthors = self._serialize_persons(contrib.secondary_authors)

        # current_plugin.logger.debug(f'[delta] coauthors -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()

        # references = list(map(export_serialize_reference, contrib.references))

        # current_plugin.logger.debug(f'[delta] references -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()

        sub_contributions = list(
            map(self._serialize_subcontribution, contrib.subcontributions))

        # current_plugin.logger.debug(f'[delta] sub_contributions -> {(datetime.now().timestamp() - start_date)}')
        # start_date = datetime.now().timestamp()

        field_values = list(
            map(self._serialize_field_value, contrib.field_values))

        editable = self._serialize_editable(event, contrib)

        session_code = ''
        if contrib.session_block.code:
            session_code = contrib.session_block.code
        else:
            session_code = contrib.session_block.session.code

        return {
            # '_type': 'Contribution',
            # '_fossil': self._fossils_mapping['contribution'].get(self._detail_level),
            'id': (contrib.legacy_mapping.legacy_contribution_id
                   if contrib.legacy_mapping else str(contrib.friendly_id)),
            # 'db_id': contrib.id,
            'friendly_id': contrib.friendly_id,
            'field_values': field_values,
            'title': contrib.title,
            'start_dt': export_serialize_date(contrib.start_dt) if contrib.start_dt else None,
            'end_dt': export_serialize_date(contrib.start_dt + contrib.duration) if contrib.start_dt else None,
            'duration': contrib.duration.seconds // 60,
            'room_name': contrib.room_name,
            'location': contrib.venue_name,
            'type': contrib.type.name if contrib.type else None,
            'description': contrib.description,
            'url': url_for('contributions.display_contribution', contrib, _external=True),
            'speakers': speakers,
            'primary_authors': primary_authors,
            'coauthors': coauthors,
            # 'keywords': contrib.keywords,
            'track': self._serialize_track_data(contrib),
            'institutes': institutes,
            # 'references': references,
            # 'board_number': contrib.board_number,
            'code': contrib.code,
            'session_code': session_code,
            'sub_contributions': sub_contributions,
            "all_revisions": editable.get('all_revisions', []) if editable else [],
            "latest_revision": editable.get('latest_revision', None) if editable else None,
            "editor": editable.get('editor', None) if editable else None
        }

    def _serialize_track_data(self, contrib):
        track = None

        if contrib.track:
            track = dict(
                code=contrib.track.code,
                title=contrib.track.title,
                description=contrib.track.description,
                position=contrib.track.position,
            )

            if contrib.track.track_group:
                track.update(dict(
                    group=dict(
                        title=contrib.track.track_group.title,
                        description=contrib.track.track_group.description,
                        position=contrib.track.track_group.position,
                    )
                ))

        return track

    def _serialize_editable(self, event, contrib):

        editable = (Editable.query
                    .with_parent(contrib)
                    .filter_by(type=1)
                    .first())

        if editable is not None:

            all_revisions = self._get_all_revisions(event, contrib, editable)

            latest_revision = self._get_latest_revision(
                event, contrib, editable)

            return {
                "id": str(editable.id),
                "type": editable.type,
                "all_revisions": all_revisions,
                "latest_revision": latest_revision,
                "editor": self._serialize_person(editable.editor)
            }

        return None

    def _get_latest_revision(self, event, contrib, editable):
        latest_revision = editable.revisions[-1]

        serialized_revision = self._serialize_editable_revision(
            event, contrib, latest_revision, True)

        return serialized_revision

    def _get_all_revisions(self, event, contrib, editable):
        revisions = [
            self._serialize_editable_revision(
                event, contrib, revision, False)
            for revision in editable.revisions
        ]

        # revisions = [el for el in revisions if len(el.get('files', [])) > 0]

        return revisions

    def _serialize_subcontribution(self, subcontrib):
        return {
            # '_type': 'SubContribution',
            # '_fossil': 'subContributionMetadata',
            'id': (subcontrib.legacy_mapping.legacy_subcontribution_id
                   if subcontrib.legacy_mapping else str(subcontrib.friendly_id)),
            # 'db_id': subcontrib.id,
            'friendly_id': subcontrib.friendly_id,
            'title': subcontrib.title,
            'duration': subcontrib.duration.seconds // 60,
            'speakers': self._serialize_persons(subcontrib.speakers),
            'references': list(map(export_serialize_reference, subcontrib.references)),
            'code': subcontrib.code,
        }

    def _serialize_convener(self, convener):
        return {
            # '_type': 'SlotChair',
            # '_fossil': 'conferenceParticipation',
            'id': convener.person_id,
            # 'db_id': convener.id,
            'title': convener.title,
            'last_name': convener.last_name,
            'first_name': convener.first_name,
            'affiliation': convener.affiliation,
            'person_id': convener.person_id,
            'address': convener.address,
            'phone': convener.phone,
            'email': convener.person.email,
        }

    def _serialize_session_block(self, event, block, serialized_session, event_contributions=[]):

        # contributions = block.contributions
        # contributions = (Contribution.query
        #                  .with_parent(block)
        #                  .options(joinedload('editables'))
        #                  .order_by(Contribution.friendly_id)
        #                  .all())

        def _contribution_filter(contribution):
            return block.id == contribution.session_block_id

        contributions = filter(_contribution_filter, event_contributions)

        # contributions_codes = [ c.code for c in contributions ]
        # current_plugin.logger.info(f"len(contributions): {contributions_codes}")
        # contributions_codes = [ c.code for c in block.contributions ]
        # current_plugin.logger.info(f"len(block.contributions): {contributions_codes}")

        block_data = {
            # '_type': 'SessionSlot',
            # '_fossil': self._fossils_mapping['block'].get(self._detail_level),
            # 'id': block.id,  # TODO: Need to check if breaking the `session_id-block_id` format is OK
            # 'conference': self._build_session_event_api_data(block.event),
            'start_dt': export_serialize_date(block.timetable_entry.start_dt) if block.timetable_entry else None,
            'end_dt': export_serialize_date(block.timetable_entry.end_dt) if block.timetable_entry else None,
            # 'description': '',  # Session blocks don't have a description
            'title': block.full_title,
            'url': url_for('sessions.display_session', block.session, _external=True),
            # list(map(self._serialize_contribution, contributions)),
            'contributions': [self._serialize_contribution(event, c) for c in contributions],
            # 'note': build_note_api_data__wrapper(block.note),
            'session': serialized_session,
            # 'room': block.get_room_name(full=False),
            'room_name': block.room_name,
            'location': block.venue_name,
            # 'inheritLoc': block.inherit_location,
            # 'inheritRoom': block.own_room is None,
            'slot_title': block.title,
            'address': block.address,
            'conveners': [self._serialize_convener(c) for c in block.person_links],
            'code': block.code if block.code else serialized_session.get('code', ''),
        }

        return block_data

    def _calculate_occurrences(self, event):
        for day in iterdays(event.start_dt, event.end_dt):
            first_start, last_end = self.find_event_day_bounds(
                event, day.date())
            if first_start is not None:
                yield {'start_dt': first_start, 'end_dt': last_end}

    def _serialize_event_occurrences(self, event):
        return [
            {
                'start_dt': period['start_dt'].astimezone(DEFAULT_TIMEZONE),
                'end_dt': period['end_dt'].astimezone(DEFAULT_TIMEZONE),
                # '_type': 'Period',
                # '_fossil': 'period'
            }
            for period in self._calculate_occurrences(event)
        ]

    def _serialize_session(self, session_):
        return {
            # '_type': 'Session',
            # '_fossil': 'sessionMinimal',
            'id': (session_.legacy_mapping.legacy_session_id
                   if session_.legacy_mapping else str(session_.friendly_id)),
            # 'db_id': session_.id,
            'friendly_id': session_.friendly_id,
            'code': session_.code,
            # 'folders': build_folders_api_data__wrapper(session_),
            'start_dt': export_serialize_date(session_.start_dt) if session_.blocks else None,
            'end_dt': export_serialize_date(session_.end_dt) if session_.blocks else None,
            'session_conveners': [self._serialize_convener(c) for c in session_.conveners],
            'title': session_.title,
            # 'bg_color': f'#{session_.colors.background}',
            # 'text_color': f'#{session_.colors.text}',
            'description': session_.description,
            # 'material': build_material_legacy_api_data__wrapper(session_),
            'is_poster': session_.is_poster,
            'type': session_.type.name if session_.type else None,
            'url': url_for('sessions.display_session', session_, _external=True),
            'room_name': session_.room_name,
            'location': session_.venue_name,
            'address': session_.address,
            'num_slots': len(session_.blocks),
        }
