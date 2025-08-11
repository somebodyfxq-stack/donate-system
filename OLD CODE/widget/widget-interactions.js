const WIDGET_BEHAVIOUR = {
  MEDIA: '1',
  TIMER: '2',
  WHEEL: '3',
};

const createInteractionWidget = (widgetConfig, data, resetAllAfterInteraction, socket, userId) => {
  if (widgetConfig.widgetBehaviour === WIDGET_BEHAVIOUR.TIMER) {
    setupTimer(widgetConfig, socket, userId);
    return
  }

  if (widgetConfig.widgetBehaviour === WIDGET_BEHAVIOUR.MEDIA) {
    setupMediaWidget(widgetConfig, data, resetAllAfterInteraction, socket, userId);
    return
  }
}
