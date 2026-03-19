from django.db import migrations, models


def set_initial_balance(apps, schema_editor):
    Portfolio = apps.get_model('main', 'Portfolio')
    Portfolio.objects.all().update(balance=10000.00)


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_alter_portfolio_balance'),
    ]

    operations = [
        migrations.AlterField(
            model_name='portfolio',
            name='balance',
            field=models.DecimalField(decimal_places=2, default=10000.0, max_digits=12),
        ),
        migrations.RunPython(set_initial_balance, migrations.RunPython.noop),
    ]
