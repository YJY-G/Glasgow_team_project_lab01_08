# Generated by Django 5.1.1 on 2024-11-02 21:32

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Location',
            fields=[
                ('location_id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, max_length=100)),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9)),
            ],
        ),
        migrations.CreateModel(
            name='ChargingPoint',
            fields=[
                ('charging_point_id', models.AutoField(primary_key=True, serialize=False)),
                ('status', models.IntegerField(choices=[(1, 'Working'), (0, 'Under Repair')], default=1)),
                ('charging_location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ebikes.location')),
            ],
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('payment_id', models.AutoField(primary_key=True, serialize=False)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=6)),
                ('payment_date', models.DateTimeField(auto_now_add=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_record', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Vehicle',
            fields=[
                ('vehicle_id', models.CharField(editable=False, max_length=6, primary_key=True, serialize=False)),
                ('vehicle_type', models.IntegerField(choices=[(1, 'Electric Scooter'), (2, 'Electric Bike')])),
                ('status', models.IntegerField(choices=[(0, 'Unavailable'), (1, 'Available'), (2, 'Rented')])),
                ('is_locked', models.BooleanField(default=True)),
                ('battery_level', models.DecimalField(decimal_places=2, max_digits=5)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('current_location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehicles', to='ebikes.location')),
            ],
        ),
        migrations.CreateModel(
            name='Report',
            fields=[
                ('report_id', models.AutoField(primary_key=True, serialize=False)),
                ('start_date', models.DateTimeField()),
                ('end_date', models.DateTimeField()),
                ('generated_on', models.DateTimeField()),
                ('issue_reported', models.TextField()),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='report', to='ebikes.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='Rental',
            fields=[
                ('rental_id', models.AutoField(primary_key=True, serialize=False)),
                ('rental_start_time', models.DateTimeField(auto_now_add=True)),
                ('rental_end_time', models.DateTimeField(blank=True, null=True)),
                ('cost', models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rental_user', to=settings.AUTH_USER_MODEL)),
                ('end_location', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='rental_ends', to='ebikes.location')),
                ('start_location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rental_starts', to='ebikes.location')),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rental', to='ebikes.vehicle')),
            ],
        ),
    ]
