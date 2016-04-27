# Why

[RescueTime](https://www.rescuetime.com) is a fantastic tool for time management and I use it mainly to understand my daily habits so I can be more productive.
Unfortunately the free version doesn't have such in-depth analysis as I like so I built my own charts using their API to access the data.
If you have suggestions for new features send me an email.
For the best result be sure to categorize activity on RescueTime!
If you want to use the old version go here!

# Usage

1.  Go to the [project page](http://ilbonte.github.io/rescuetime-again/)
2.  Choose the data source: directly from RT or upload you files (see below for more information)
3.  ????
4.  PROFIT!

## Notes

RescueTime's free plan allows you to see only the last tree month of data, so if you don't own a premium account be sure to select a period of time within 3 month from now.

If you have a free plan and you would like to analyse a period longer than 3 months or examine your old data there is a "workaround":
* From the main page, you can download the json file containing your data for the selected range. I usually download my data once a month (e.g. on May I download the data for April) and I store the files on Dropbox
* Once that you have collected enough file you can merge them in a single one so you analyse it thought the main page. To merge the file go to the “merge page” and select the file you would like to merge. Note that the files must all be of the same type (efficiency or activity). You cannot merge efficiency and activities!


## Contributing

Pull requests for bux-fix are welcome. If you want to add a new feature just open an issue before so we can discuss together

## Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

### [2.0.0] - 27-04-2016
#### Notable changes:
- Full rewrite of the JS code
- Moved from Google charts to Highcarts
- Merge page supports multiple file upload

### [1.0.0] - 01-12-2015
#### Notable changes:
- Added merge page
- Added combined chart for day and hour

### Example
[Example output with 11 months of data](http://i.imgur.com/h1PElrI.png)
![alt tag](http://i.imgur.com/h1PElrI.png)
