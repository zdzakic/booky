from modeltranslation.translator import translator, TranslationOptions
from .models import ServiceType

class ServiceTypeTranslationOptions(TranslationOptions):
    fields = ('name',)

translator.register(ServiceType, ServiceTypeTranslationOptions)
