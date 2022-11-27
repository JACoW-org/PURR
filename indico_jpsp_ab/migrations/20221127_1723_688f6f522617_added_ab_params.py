"""added ab params

Revision ID: 688f6f522617
Revises: a23f5fe2724d
Create Date: 2022-11-27 17:23:54.426304
"""

import sqlalchemy as sa
from alembic import op

schema = 'plugin_jpsp_ab'


# revision identifiers, used by Alembic.
revision = '688f6f522617'
down_revision = 'a23f5fe2724d'
branch_labels = None
depends_on = None

# ab_session_h1 = FloatField(_('PDF SESSION H1'), [DataRequired()])
# ab_session_h2 = FloatField(_('PDF SESSION H2'), [DataRequired()])
# ab_contribution_h1 = FloatField(_('AB CONTRIBUTION H1'), [DataRequired()])


def upgrade():
    # ### Add new columns ###

    ab_session_h1 = sa.Column('ab_session_h1', sa.String(),
                              nullable=True, server_default='')
    ab_session_h2 = sa.Column('ab_session_h2', sa.String(),
                              nullable=True, server_default='')
    ab_contribution_h1 = sa.Column('ab_contribution_h1', sa.String(),
                                   nullable=True, server_default='')

    op.add_column('jpsp_settings', ab_session_h1, schema=schema)
    op.add_column('jpsp_settings', ab_session_h2, schema=schema)
    op.add_column('jpsp_settings', ab_contribution_h1, schema=schema)

  
    # ### end ###


def downgrade():
    # ### Del new columns ###

    op.drop_column('jpsp_settings', 'ab_contribution_h1', schema=schema)
    op.drop_column('jpsp_settings', 'ab_session_h2', schema=schema)
    op.drop_column('jpsp_settings', 'ab_session_h1', schema=schema)
    
    # ### end ###
