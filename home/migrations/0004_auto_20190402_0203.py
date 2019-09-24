# Generated by Django 2.0.3 on 2019-04-02 02:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0003_membershipplan_duration'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_membership_id',
            field=models.CharField(default='None', max_length=150),
        ),
        migrations.AlterUniqueTogether(
            name='usermembership',
            unique_together={('id', 'user')},
        ),
    ]