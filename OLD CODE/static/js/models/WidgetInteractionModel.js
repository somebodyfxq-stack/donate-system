import FontModel from './FontModel';
import widgetEnum from '../enums/widgetEnum';

class WidgetInteractionModel {
  widgetName = 'Новий віджет';
  widgetBehaviour = '1'; // 1: video 2: timer
  fontCounter = new FontModel({fontAnimation: 'bounce'});
  videoTitleFont = new FontModel();
  donatorNameFont = new FontModel();
  textAnimation = 'bounce';
  initialTime = 60;
  volume = 8;
  tieAmountToTime = false;
  donateAmountToMinutes = false;
  timeReduction2x = '';
  timeReduction4x = '';
  videoTimeLimit = 5;
  amountPerSecond = 0.5;
  widgetAvailable = true; //dont change it
  widgetType = 'interactions';
  // approveWidgetAutomatically = true;
  autoStartVideo = true;
  timer = '1'; // countdown - 1: seconds 2: money
  showDonateImmediately = false;
  showVideoTitle = false;
  showDonatorName = false;
  minVideoLikes = 0;
  minVideoViews = 0;
  minVideoComments = 0;
  widgetStatus = widgetEnum.WidgetStatus.active;
  readText = true;
  textToShow = 'Переміг сектор - {winner}!';
  textToDisplay = 'Зібрано {got}/{amount} {currency}';
  amounts = [{
    minAmount: 5,
    maxAmount: 100,
    isSpecificAmount: false,
    specificAmount: 100
  }];
  startFromAmount = false;
  amount = 1000;
  sectorsOfWheel = [
    {color:"#f82", label:"Сектор1", percentage: 25},
    {color:"#0bf", label:"Сектор2", percentage: 25},
    {color:"#fb0", label:"Сектор3", percentage: 25},
    {color:"#0fb", label:"Сектор4", percentage: 25},
  ];
}

export default WidgetInteractionModel;
