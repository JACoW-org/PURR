from indico.core.db import db


class PurrSettingsModel(db.Model):
    __tablename__ = 'purr_settings'
    __table_args__ = (db.Index(None, 'user_id', 'event_id'),
                      {'schema': 'plugin_purr'})

    #: Entry ID (mainly used to sort by insertion order)
    id = db.Column(
        db.Integer,
        primary_key=True
    )
    
    #: ID of the user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.users.id'),
        index=True,
        nullable=False
    )
    
    #: ID of the event
    event_id = db.Column(
        db.Integer,
        db.ForeignKey('events.events.id'),
        index=True,
        nullable=False
    )
    
    #: The User associated with 
    user = db.relationship(
        'User',
        lazy=False,
        backref=db.backref(
            'purr_settings_user',
            lazy='dynamic'
        )
    )
    
    #: The Event associated with
    event = db.relationship(
        'Event',
        lazy=True,
        backref=db.backref(
            'purr_settings_event',
            lazy='dynamic'
        )
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

    def __repr__(self):
        return u'<PurrSettingsModel({}, {}, {}, {}, {}, {}, {}, {}, {})>'.format(
            self.id, self.api_url, self.api_key, self.custom_fields, 
            self.ab_session_h1, self.ab_session_h2, self.ab_contribution_h1,
            self.ab_contribution_h2, self.event_id)
