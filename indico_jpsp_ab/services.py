from abc import ABC
from flask import session

from collections import defaultdict
from hashlib import md5

from collections import defaultdict
from operator import attrgetter
from sqlalchemy import Date, cast

from indico.util.date_time import iterdays
from indico.web.flask.util import url_for

from indico.core.db.sqlalchemy.principals import PrincipalType
from indico.core.db.sqlalchemy.protection import ProtectionMode
from indico.modules.rb.models.reservation_occurrences import ReservationOccurrence

from indico.modules.events.contributions import contribution_settings
from indico.modules.events.timetable.models.entries import TimetableEntry

from indico.modules.events.models.persons import PersonLinkBase

from indico_jpsp_ab.utils import DEFAULT_TIMEZONE

from indico_jpsp_ab.wrappers import build_folders_api_data__wrapper, \
    build_material_legacy_api_data__wrapper, build_note_api_data__wrapper, \
    build_note_legacy_api_data__wrapper



class ABCExportEvent(ABC):

    _detail_level = 'sessions'

    _fossils_mapping = {
        'event': {
            'events': 'conferenceMetadata',
            'contributions': 'conferenceMetadataWithContribs',
            'subcontributions': 'conferenceMetadataWithSubContribs',
            'sessions': 'conferenceMetadataWithSessions'
        },
        'contribution': {
            'contributions': 'contributionMetadata',
            'subcontributions': 'contributionMetadataWithSubContribs',
            'sessions': 'contributionMetadataWithSubContribs'
        },
        'block': {
            'sessions': 'sessionMetadata',
            'contributions': 'sessionMetadataWithContributions'
        },
        'person': {
            'Avatar': 'conferenceChairMetadata',
            'ConferenceChair': 'conferenceChairMetadata',
            'ContributionParticipation': 'contributionParticipationMetadata',
            'SubContribParticipation': 'contributionParticipationMetadata'
        }
    }

    def _serialize_reference(self, reference):
        return {
            'type': reference.reference_type.name,
            'value': reference.value,
            'url': reference.url,
            'urn': reference.urn
        }

    def _serialize_access_list(self, obj):
        data = {'users': [], 'groups': []}
        for manager in obj.get_access_list():
            if manager.principal_type in (PrincipalType.user, PrincipalType.email):
                data['users'].append(manager.email)
            elif manager.principal_type == PrincipalType.multipass_group:
                data['groups'].append(manager.name)
        return data

    def _serialize_date(self, date):
        if date:
            date = date.astimezone(DEFAULT_TIMEZONE)
            return {
                'date': str(date.date()),
                'time': str(date.time()),
                'tz': str(date.tzinfo)
            }

    def _build_event_api_data_base(self, event):
        return {
            '_type': 'Conference',
            'id': str(event.id),
            'title': event.title,
            'description': event.description,
            'startDate': self._serialize_date(event.start_dt),
            'timezone': event.timezone,
            'endDate': self._serialize_date(event.end_dt),
            'room': event.get_room_name(full=False),
            'location': event.venue_name,
            'address': event.address,
            'type': event.type_.legacy_name,
            'references': list(map(self._serialize_reference, event.references))
        }

    def _serialize_person(self, person, person_type, can_manage=False):
        if person:
            data = {
                '_type': person_type,
                '_fossil': self._fossils_mapping['person'].get(person_type, None),
                'first_name': person.first_name,
                'last_name': person.last_name,
                'fullName': person.get_full_name(last_name_upper=False, abbrev_first_name=False),
                'id': str(person.id),
                'affiliation': person.affiliation,
                'emailHash': md5(person.email.encode()).hexdigest() if person.email else None
            }
            if isinstance(person, PersonLinkBase):
                data['db_id'] = person.id
                data['person_id'] = person.person_id
            if can_manage:
                data['email'] = person.email or None
            if person_type == 'ConferenceChair':
                data['fullName'] = person.get_full_name(last_name_upper=False, abbrev_first_name=False,
                                                        show_title=True)
            return data

    def _serialize_persons(self, persons, person_type, can_manage=False):
        return [self._serialize_person(person, person_type, can_manage) for person in persons]

    def _serialize_contribution(self, contrib, include_subcontribs=True):
        can_manage = session.user is not None and contrib.can_manage(session.user)
        data = {
            '_type': 'Contribution',
            '_fossil': self._fossils_mapping['contribution'].get(self._detail_level),
            'id': (contrib.legacy_mapping.legacy_contribution_id
                   if contrib.legacy_mapping else str(contrib.friendly_id)),
            'db_id': contrib.id,
            'friendly_id': contrib.friendly_id,
            'title': contrib.title,
            'startDate': self._serialize_date(contrib.start_dt) if contrib.start_dt else None,
            'endDate': self._serialize_date(contrib.start_dt + contrib.duration) if contrib.start_dt else None,
            'duration': contrib.duration.seconds // 60,
            'roomFullname': contrib.room_name,
            'room': contrib.get_room_name(full=False),
            'note': build_folders_api_data__wrapper(contrib.note),
            'location': contrib.venue_name,
            'type': contrib.type.name if contrib.type else None,
            'description': contrib.description,
            'folders': build_folders_api_data__wrapper(contrib),
            'url': url_for('contributions.display_contribution', contrib, _external=True),
            'material': build_material_legacy_api_data__wrapper(contrib),
            'speakers': self._serialize_persons(contrib.speakers, person_type='ContributionParticipation',
                                                can_manage=can_manage),
            'primaryauthors': self._serialize_persons(contrib.primary_authors, person_type='ContributionParticipation',
                                                      can_manage=can_manage),
            'coauthors': self._serialize_persons(contrib.secondary_authors, person_type='ContributionParticipation',
                                                 can_manage=can_manage),
            'keywords': contrib.keywords,
            'track': contrib.track.title if contrib.track else None,
            'session': contrib.session.title if contrib.session else None,
            'references': list(map(self._serialize_reference, contrib.references)),
            'board_number': contrib.board_number,
            'code': contrib.code,
        }
        if include_subcontribs:
            data['subContributions'] = list(
                map(self._serialize_subcontribution, contrib.subcontributions))
        if can_manage:
            data['allowed'] = self._serialize_access_list(contrib)
        return data

    def _serialize_subcontribution(self, subcontrib):
        can_manage = session.user is not None and subcontrib.contribution.can_manage(session.user)
        data = {
            '_type': 'SubContribution',
            '_fossil': 'subContributionMetadata',
            'id': (subcontrib.legacy_mapping.legacy_subcontribution_id
                   if subcontrib.legacy_mapping else str(subcontrib.friendly_id)),
            'db_id': subcontrib.id,
            'friendly_id': subcontrib.friendly_id,
            'title': subcontrib.title,
            'duration': subcontrib.duration.seconds // 60,
            'note': build_note_api_data__wrapper(subcontrib.note),
            'material': build_material_legacy_api_data__wrapper(subcontrib),
            'folders': build_folders_api_data__wrapper(subcontrib),
            'speakers': self._serialize_persons(subcontrib.speakers, person_type='SubContribParticipation',
                                                can_manage=can_manage),
            'references': list(map(self._serialize_reference, subcontrib.references)),
            'code': subcontrib.code,
        }
        return data

    def _serialize_convener(self, convener, can_manage=False):
        data = {
            'fax': '',
            'familyName': convener.last_name,
            'firstName': convener.first_name,
            'name': convener.get_full_name(last_name_upper=False, abbrev_first_name=False),
            'last_name': convener.last_name,
            'first_name': convener.first_name,
            'title': convener.title,
            '_type': 'SlotChair',
            'affiliation': convener.affiliation,
            '_fossil': 'conferenceParticipation',
            'fullName': convener.get_full_name(last_name_upper=False, abbrev_first_name=False),
            'id': convener.person_id,
            'db_id': convener.id,
            'person_id': convener.person_id,
            'emailHash': md5(convener.person.email.encode()).hexdigest() if convener.person.email else None
        }
        if can_manage:
            data['address'] = convener.address,
            data['phone'] = convener.phone,
            data['email'] = convener.person.email,
        return data

    def _serialize_reservations(self, reservations):
        res = defaultdict(list)
        for resv in reservations:
            occurrences = (resv.occurrences
                           .filter(ReservationOccurrence.is_valid)
                           .options(ReservationOccurrence.NO_RESERVATION_USER_STRATEGY)
                           .all())
            res[resv.room.full_name] += [{'startDateTime': occ.start_dt, 'endDateTime': occ.end_dt}
                                         for occ in occurrences]
        return res

    def _build_session_event_api_data(self, event):
        data = self._build_event_api_data_base(event)
        data.update({
            '_fossil': 'conference',
            'adjustedStartDate': self._serialize_date(event.start_dt_local),
            'adjustedEndDate': self._serialize_date(event.end_dt_local),
            'bookedRooms': self._serialize_reservations(event.reservations),
            'supportInfo': {
                '_fossil': 'supportInfo',
                'caption': event.contact_title,
                '_type': 'SupportInfo',
                'email': ', '.join(event.contact_emails),
                'telephone': ', '.join(event.contact_phones)
            },
        })
        return data

    def _serialize_session_block(self, block, serialized_session, session_access_list, can_manage):
        block_data = {
            '_type': 'SessionSlot',
            '_fossil': self._fossils_mapping['block'].get(self._detail_level),
            'id': block.id,  # TODO: Need to check if breaking the `session_id-block_id` format is OK
            'conference': self._build_session_event_api_data(block.event),
            'startDate': self._serialize_date(block.timetable_entry.start_dt) if block.timetable_entry else None,
            'endDate': self._serialize_date(block.timetable_entry.end_dt) if block.timetable_entry else None,
            'description': '',  # Session blocks don't have a description
            'title': block.full_title,
            'url': url_for('sessions.display_session', block.session, _external=True),
            'contributions': list(map(self._serialize_contribution, block.contributions)),
            'note': build_note_api_data__wrapper(block.note),
            'session': serialized_session,
            'room': block.get_room_name(full=False),
            'roomFullname': block.room_name,
            'location': block.venue_name,
            'inheritLoc': block.inherit_location,
            'inheritRoom': block.own_room is None,
            'slotTitle': block.title,
            'address': block.address,
            'conveners': [self._serialize_convener(c, can_manage) for c in block.person_links],
            'code': block.code,
        }
        if session_access_list:
            block_data['allowed'] = session_access_list
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
                'startDT': period['start_dt'].astimezone(DEFAULT_TIMEZONE),
                'endDT': period['end_dt'].astimezone(DEFAULT_TIMEZONE),
                '_type': 'Period',
                '_fossil': 'period'
            }
            for period in self._calculate_occurrences(event)
        ]

    def _serialize_session(self, session_, can_manage=False):
        return {
            'folders': build_folders_api_data__wrapper(session_),
            'startDate': self._serialize_date(session_.start_dt) if session_.blocks else None,
            'endDate': self._serialize_date(session_.end_dt) if session_.blocks else None,
            '_type': 'Session',
            'sessionConveners': [self._serialize_convener(c, can_manage) for c in session_.conveners],
            'title': session_.title,
            'color': f'#{session_.colors.background}',
            'textColor': f'#{session_.colors.text}',
            'description': session_.description,
            'material': build_material_legacy_api_data__wrapper(session_),
            'isPoster': session_.is_poster,
            'type': session_.type.name if session_.type else None,
            'url': url_for('sessions.display_session', session_, _external=True),
            'roomFullname': session_.room_name,
            'location': session_.venue_name,
            'address': session_.address,
            '_fossil': 'sessionMinimal',
            'numSlots': len(session_.blocks),
            'id': (session_.legacy_mapping.legacy_session_id
                   if session_.legacy_mapping else str(session_.friendly_id)),
            'db_id': session_.id,
            'friendly_id': session_.friendly_id,
            'room': session_.get_room_name(full=False),
            'code': session_.code,
        }

    def _build_session_api_data(self, session_):
        can_manage = session.user is not None and session_.can_manage(session.user)
        session_access_list = None
        serialized_session = self._serialize_session(session_, can_manage)
        if can_manage:
            session_access_list = self._serialize_access_list(session_)
        return [self._serialize_session_block(b, serialized_session, session_access_list, can_manage)
                for b in session_.blocks]

    def _build_event_api_data(self, event):
        can_manage = session.user is not None and event.can_manage(session.user)
        data = self._build_event_api_data_base(event)
        material_data = build_material_legacy_api_data__wrapper(event)
        if legacy_note_material := build_note_legacy_api_data__wrapper(event.note):
            if material_data is not None:
                material_data.append(legacy_note_material)
            else:
                print('Error: material_data is None')
        data.update({
            '_fossil': self._fossils_mapping['event'].get(self._detail_level),
            'categoryId': event.category_id,
            'category': event.category.title,
            'note': build_note_api_data__wrapper(event.note),
            'roomFullname': event.room_name,
            'url': event.external_url,
            'creationDate': self._serialize_date(event.created_dt),
            'creator': self._serialize_person(event.creator, person_type='Avatar', can_manage=can_manage),
            'hasAnyProtection': event.effective_protection_mode != ProtectionMode.public,
            'roomMapURL': event.room.map_url if event.room else None,
            'folders': build_folders_api_data__wrapper(event),
            'chairs': self._serialize_persons(event.person_links, person_type='ConferenceChair', can_manage=can_manage),
            'material': material_data,
            'keywords': event.keywords,
            'organizer': event.organizer_info,
        })

        event_category_path = event.category.chain
        visibility = {'id': '', 'name': 'Everywhere'}
        if event.visibility is None:
            pass  # keep default
        elif event.visibility == 0:
            visibility['name'] = 'Nowhere'
        elif event.visibility:
            try:
                path_segment = event_category_path[-event.visibility]
            except IndexError:
                pass
            else:
                visibility['id'] = path_segment['id']
                visibility['name'] = path_segment['title']
        data['visibility'] = visibility

        if can_manage:
            data['allowed'] = self._serialize_access_list(event)

        allow_details = contribution_settings.get(
            event, 'published') or can_manage
        if self._detail_level in {'contributions', 'subcontributions'}:
            data['contributions'] = []
            if allow_details:
                for contribution in event.contributions:
                    include_subcontribs = self._detail_level == 'subcontributions'
                    serialized_contrib = self._serialize_contribution(
                        contribution, include_subcontribs)
                    data['contributions'].append(serialized_contrib)
        elif self._detail_level == 'sessions':
            data['contributions'] = []
            data['sessions'] = []
            if allow_details:
                # Contributions without a session
                for contribution in event.contributions:
                    if not contribution.session:
                        serialized_contrib = self._serialize_contribution(
                            contribution)
                        data['contributions'].append(serialized_contrib)

                for session_ in event.sessions:
                    data['sessions'].extend(
                        self._build_session_api_data(session_))
        data['occurrences'] = self._serialize_event_occurrences(event)
        return data

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
