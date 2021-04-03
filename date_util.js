'use strict';

if (typeof(WebUtil)=="undefined"){
  WebUtil = {};
}

SUBROSA.Date_Util=(function(){

  var month_name_en = [ 'Jan','Feb','March', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

  function short_date(past_date, reference_date){
    if (!reference_date){
      reference_date = new Date();
    }

    var seconds = Math.floor((reference_date-past_date)/1000);
    if (seconds < 0){
      return "";
    }

    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);
    var years = Math.floor(days/365);

    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    var str;

    if (years != 0){
      str = (1900+past_date.getYear()).toString();
    } else if (days != 0){
      str = month_name_en[past_date.getMonth()]+" "+past_date.getDate();
    } else if (hours != 0 || minutes > 0){
      var time_hours = past_date.getHours();
      var am_pm = time_hours >= 12 ? "PM" : "AM";
      str = (time_hours % 12)+":"+zero_pad(past_date.getMinutes(),2)+" "+am_pm;
    } else if (seconds != 0){
      str = seconds+"s ago"
    } else {
      str = "now";
    }
    return str;
  }

  function zero_pad(value, count){
    var result = value.toString();
    count -= result.length;
    while (count-- > 0){
      result = "0"+result;
    }
    return result;
  }

  function time_ago(past_date, reference_date){
    if (!reference_date){
      reference_date = new Date();
    }

    var seconds = Math.floor((reference_date-past_date)/1000);
    if (seconds < 0){
      return "";
    }

    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);
    var years = Math.floor(days/365);

    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    var str;
    var count = 0;

    if (years != 0){
      str = years+" "+plural(years, "year")+" ago";
    } else if (days != 0){
      str = days+" "+plural(days, "day")+" ago";
    } else if (hours != 0){
      str = hours+" "+plural(hours, "hour")+" ago";
    } else if (minutes != 0){
      str = minutes+" "+plural(minutes, "minute")+" ago";
    } else if (seconds != 0){
      str = seconds+"s ago";
    } else {
      str = "now";
    }
    return str;
  }


  function time_remaining_until(future_date, reference_date){
    if (!reference_date){
      reference_date = new Date();
    }

    var seconds = Math.floor((future_date - reference_date)/1000);
    if (seconds < 0){
      return "";
    }

    var minutes = Math.floor(seconds/60);
    console.log("minutes: ", minutes);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);

    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    var tokens = [];
    var str = "";
    var count = 0;

    if (days != 0){
      str = days+" "+plural(days, "day");
      count++;
    }

    if (hours != 0){
      str = hours+" "+plural(hours, "hour");
      count++;
    }

    if (minutes != 0){
      str += (count == 1 ? "," : "")+" "+minutes+" "+plural(minutes, "minute");
      count++;
    }

    if (seconds != 0){
      if (count == 1){
        str += " and ";
      } else if (count >= 2){
        str += ", and ";
      }
      str += seconds+" "+plural(seconds, "second");
      count++;
    }
    return str;
  }

  function date_str_to_epoch(date_str){ // input is like this: 2019/01/30
    var date = new Date(date_str + " 00:00:00"); 
    var epoch = Math.round(date.getTime()/1000.0);
    return epoch;
  }

  function date_to_epoch(date){
    var epoch = Math.round(date.getTime()/1000.0);
    return epoch;
  }

  return SUBROSA.module_exports({public:{
    short_date,
    time_remaining_until,
    time_ago,
    date_str_to_epoch,
    date_to_epoch,
  }});
})();
