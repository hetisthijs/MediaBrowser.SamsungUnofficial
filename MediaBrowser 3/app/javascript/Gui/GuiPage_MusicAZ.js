var GuiPage_MusicAZ = {
		Letters : ["#","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","?"],
		selectedItem : 0,
		topLeftItem : 0,
		
		bannerItems : ["Latest","Recent","Frequent","Album","Album Artist", "Artist"],
		selectedBannerItem : 0,
		
		MAXCOLUMNCOUNT : 10,
		MAXROWCOUNT : 4,

		startParams : []
}

GuiPage_MusicAZ.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}


GuiPage_MusicAZ.start = function(entryView) {
	//Save Start Vars
	this.startParams = [entryView];
	
	//Reset Vars
	this.selectedItem = 0;
	this.topLeftItem = 0;

	//Proceed as Normal	
	//Update Padding on pageContent
	document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='guiDisplay_Series-Banner'></div><div id=Center class='SeriesCenter'><div id=Content style='padding-top:20px;'></div></div>" +
			"<div style='padding-top:260px;padding-left:4px;'><p id=pageTitle2 style='font-size:22px;'></p><div id=Content2></div></div>";
		
	//Set banner Styling
	document.getElementById("bannerSelection").style.paddingTop="10px";
	document.getElementById("bannerSelection").style.paddingBottom="5px";
		
	//Display first XX series
	this.updateDisplayedItems();
		
	//Update Selected Collection CSS
	this.updateSelectedItems(false);
		
	//Set Banner Items
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index != this.bannerItems.length-1) {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding'>"+this.bannerItems[index].replace(/-/g, ' ').toUpperCase()+"</div>";			
		} else {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='guiDisplay_Series-BannerItem'>"+this.bannerItems[index].replace(/-/g, ' ').toUpperCase()+"</div>";					
		}
	}
	
	//Update Selected Banner Item
	this.selectedBannerItem = -1;
	this.updateSelectedBannerItems();
	this.selectedBannerItem = 0;
	
	//Set Focus for Key Events
	document.getElementById("GuiPage_MusicAZ").focus();	
}

//---------------------------------------------------------------------------------------------------
//      TOP ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------
GuiPage_MusicAZ.updateDisplayedItems = function() {
	var htmlToAdd = "";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.Letters.length); index++) {
		htmlToAdd += "<div id="+this.Letters[index] + "><div style='text-align:center;font-size:40px;padding-top:15px;'>"+this.Letters[index] + "</div></div>";
	}
	document.getElementById("Content").innerHTML = htmlToAdd;
}

//Function sets CSS Properties so show which user is selected
GuiPage_MusicAZ.updateSelectedItems = function (bypassCounter) {
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.Letters.length); index++){	
		if (index == this.selectedItem) {
			document.getElementById( this.Letters[index]).className = "Letter Selected";			
		} else {	
			document.getElementById(this.Letters[index]).className = "Letter";		
		}			
    }
	
	//Update Counter DIV
	if (this.Letters.length == 0) {
		document.getElementById("Counter").innerHTML = "";
	} else {
		document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.Letters.length;	
	}
}

GuiPage_MusicAZ.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding red";
			} else {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem red";
			}		
		} else {
			if (index != this.bannerItems.length-1) {
				if (this.bannerItems[index] == this.startParams[0]) {
					document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding blue";
				} else {
					document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding";
				}
			} else {
				if (this.bannerItems[index] == this.startParams[0]) {
					document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem blue";
				} else {
					document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem";
				}
			}
		}
	}
	if (this.selectedItem == -1) {
		document.getElementById("Counter").innerHTML = (this.selectedBannerItem+1) + "/" + this.bannerItems.length;
	}
}

GuiPage_MusicAZ.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	//Update Screensaver Timer
	Support.screensaver();
	
	//If screensaver is running 
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();
		
		//End Screensaver
		GuiImagePlayer_Screensaver.stopScreensaver();
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode){
		case tvKey.KEY_LEFT:
			alert("LEFT");	
			this.processTopMenuLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");	
			this.processTopMenuRightKey();
			break;
		case tvKey.KEY_DOWN:
			alert ("DOWN");
			this.processTopMenuDownKey();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processTopMenuEnterKey();
			break;		
		case tvKey.KEY_RED:
			//Disabled v0.570d
			//this.processIndexing();
			break;	
		case tvKey.KEY_UP:	
			this.processTopMenuUpKey();
			break;
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY BOTTOM");
			widgetAPI.blockNavigation(event);
			//Return added here - deleted in MainMenu if user does return
			if (this.selectedItem == -1) {		
				if (this.selectedBannerItem != this.bannerItems.length-1) {
					document.getElementById("bannerItem"+this.selectedBannerItem).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding";
				} else {
					document.getElementById("bannerItem"+this.selectedBannerItem).className = "guiDisplay_Series-BannerItem";
				}
				this.selectedItem = 0;
				this.topLeftItem = 0;
			}
			Support.updateURLHistory("GuiPage_MusicAZ",this.startParams[0],null,null,null,this.selectedItem,this.topLeftItem,true);
			GuiMainMenu.requested("GuiPage_MusicAZ",this.Letters[this.selectedItem]);
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;		
		case tvKey.KEY_BLUE:	
			GuiMusicPlayer.showMusicPlayer("GuiPage_MusicAZ");
			break;	
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
}

GuiPage_MusicAZ.processTopMenuLeftKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem--;
		if (this.selectedBannerItem < 0) {
			this.selectedBannerItem = 0;
		}
		this.updateSelectedBannerItems();	
	} else {
		this.selectedItem--;
		if (this.selectedItem < 0) {
			this.selectedItem = 0;
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem = this.selectedItem - (this.getMaxDisplay() - 1);
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
}

GuiPage_MusicAZ.processTopMenuRightKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem >= this.bannerItems.length) {
			this.selectedBannerItem--;
		}
		this.updateSelectedBannerItems();	
	} else {
		this.selectedItem++;
		if (this.selectedItem >= this.Letters.length) {
			this.selectedItem--;
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
}

GuiPage_MusicAZ.processTopMenuUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		this.selectedBannerItem = 0;
		this.selectedItem = -1;
		this.updateSelectedItems();	
		//update selected banner item
		this.updateSelectedBannerItems();	
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}	
}

GuiPage_MusicAZ.processTopMenuDownKey = function() {
	if (this.selectedItem == -1) {
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
	} else {
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
		if (this.selectedItem >= this.Letters.length) {
			if (this.totalRecordCount > this.Letters.length) {
				this.loadMoreItems();
				
				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
					this.updateDisplayedItems();
				}
				
			} else {
				this.selectedItem = (this.Letters.length-1);
				if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
					this.updateDisplayedItems();
				}
			}	
		} else {
			if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				this.updateDisplayedItems();
			}
		}
	}
	this.updateSelectedItems();
}

GuiPage_MusicAZ.processTopMenuEnterKey = function() {
	alert ("TopMenuEnterKey");
	if (this.selectedItem == -1) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "Latest":
			var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Audio&Limit=21&fields=SortName,Genres");
			GuiDisplay_Series.start("Latest Music",url,0,0);
		break;	
		case "Recent":
			var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items?format=json&SortBy=DatePlayed&SortOrder=Descending&IncludeItemTypes=Audio&Limit=21&Filters=IsPlayed&Recursive=true&fields=SortName,Genres");
			GuiDisplay_Series.start("Recent Music",url,0,0);
			break;
		case "Frequent": //Music Only
			var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items?format=json&SortBy=PlayCount&SortOrder=Descending&IncludeItemTypes=Audio&Limit=21&Filters=IsPlayed&Recursive=true&fields=SortName,Genres");
			GuiDisplay_Series.start("Frequent Music",url,0,0);
			break;		
		case "Album":	
		case "Album Artist":	
		case "Artist":	
			GuiPage_MusicAZ.start(this.bannerItems[this.selectedBannerItem]);	
			break;
		}	
	} else {
		var urlString = (this.selectedItem == 0) ? "&NameLessThan=A" : "&NameStartsWith=" + this.Letters[this.selectedItem];
		urlString = (this.selectedItem == 27) ? "&NameStartsWithOrGreater=~" : urlString;
		
		Support.updateURLHistory("GuiPage_MusicAZ",this.startParams[0],null,null,null,this.selectedItem,this.topLeftItem,null);
		switch (this.startParams[0]) {
		case "Album":
			var url = Server.getItemTypeURL("&IncludeItemTypes=MusicAlbum&Recursive=true&ExcludeLocationTypes=Virtual&fields=SortName,Genres&CollapseBoxSetItems=false" + urlString);
			GuiDisplay_Series.start("Album Music",url,0,0);
		break;
		case "Album Artist":
			var url1 = Server.getCustomURL("/Artists/AlbumArtists?format=json&SortBy=SortName&SortOrder=Ascending&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,Genres&userId=" + Server.getUserID() + urlString);
			GuiPage_MusicArtist.start("Album Artist",url1);
			break;
		case "Artist":
			var url = Server.getCustomURL("/Artists?format=json&SortBy=SortName&SortOrder=Ascending&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName,Genres&userId=" + Server.getUserID() + urlString);
			GuiDisplay_Series.start("Artist Music",url,0,0);
			break;
		default:
			break;
		}
	}		
}

GuiPage_MusicAZ.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}