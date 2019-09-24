from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

"""
celery_app -> enable in __init__.py
	-- Grabs all function decorated with @app.task WHERE app is the app in clery_app.py
	-- start via:: ~/workspace_p36/virtual/tracker$ celery -A tracker worker -l info
"""

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gym_cms.settings')

app = Celery("gym_cms")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

if __name__ == '__main__':
	app.start()