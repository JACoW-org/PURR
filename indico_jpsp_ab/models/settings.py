from indico.core.db import db


class JpspSettingsModel(db.Model):
    __tablename__ = 'jpsp_settings'
    __table_args__ = (db.Index(None, 'user_id', 'event_id'),
                      {'schema': 'plugin_jpsp_ab'})

    #: Entry ID (mainly used to sort by insertion order)
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    
    api_url = db.Column(
        db.String,
        nullable=False,
        default=''
    )
    
    api_key = db.Column(
        db.String,
        nullable=False,
        default=''
    )
    
    pdf_page_width = db.Column(
        db.Float,
        nullable=False,
        default=0.1
    )
    
    pdf_page_height = db.Column(
        db.Float,
        nullable=False,
        default=0.1
    )
    
    custom_fields = db.Column(
        db.String,
        nullable=True
    )
    
    #: ID of the user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.users.id'),
        index=True,
        nullable=False
    )
    
    ab_session_h1 = db.Column(
        db.String,
        nullable=False,
        default=''
    )
    
    ab_session_h2 = db.Column(
        db.String,
        nullable=False,
        default=''
    )
    
    ab_contribution_h1 = db.Column(
        db.String,
        nullable=False,
        default=''
    )
    
    ab_contribution_h2 = db.Column(
        db.String,
        nullable=False,
        default=''
    )
    
    #: ID of the event
    event_id = db.Column(
        db.Integer,
        db.ForeignKey('events.events.id'),
        index=True,
        nullable=False
    )
    
    #: The user associated with the queue entry
    user = db.relationship(
        'User',
        lazy=False,
        backref=db.backref(
            'outlook_queue',
            lazy='dynamic'
        )
    )
    
    #: The Event this queue entry is associated with
    event = db.relationship(
        'Event',
        lazy=True,
        backref=db.backref(
            'outlook_queue_entries',
            lazy='dynamic'
        )
    )

    def __repr__(self):
        return u'<JpspSettingsModel({}, {}, {}, {}, {}, {}, {}, {}, {})>'.format(
            self.id, self.api_url, self.api_key, self.custom_fields, 
            self.ab_session_h1, self.ab_session_h2, self.ab_contribution_h1,
            self.ab_contribution_h2, self.event_id)
