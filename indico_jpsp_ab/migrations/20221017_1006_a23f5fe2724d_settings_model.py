"""settings model

Revision ID: a23f5fe2724d
Revises: 
Create Date: 2022-10-17 10:06:21.702554
"""

import sqlalchemy as sa
from alembic import op

from sqlalchemy.sql.ddl import CreateSchema, DropSchema

schema = 'plugin_jpsp_ab'

# revision identifiers, used by Alembic.
revision = 'a23f5fe2724d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute(CreateSchema(schema))

    op.create_table('jpsp_settings',
                    sa.Column('id', sa.INTEGER(),
                              autoincrement=True, nullable=False),

                    sa.Column('user_id', sa.INTEGER(),
                              nullable=False, index=True),
                    sa.Column('event_id', sa.INTEGER(),
                              nullable=False, index=True),

                    sa.Column('api_url', sa.VARCHAR(), nullable=False),
                    sa.Column('api_key', sa.VARCHAR(), nullable=False),

                    sa.Column('pdf_page_width', sa.FLOAT(), nullable=False),
                    sa.Column('pdf_page_height', sa.FLOAT(), nullable=False),

                    sa.Column('custom_fields', sa.VARCHAR(), nullable=True),

                    sa.ForeignKeyConstraint(
                        ['event_id'], ['events.events.id']),

                    sa.ForeignKeyConstraint(['user_id'], ['users.users.id']),
                    sa.PrimaryKeyConstraint('id'),

                    schema=schema)

    op.create_index(None, 'jpsp_settings',
                    ['user_id', 'event_id'],
                    schema=schema)


def downgrade():
    op.drop_table('jpsp_settings', schema=schema)
    op.execute(DropSchema(schema))
