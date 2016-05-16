WMEAC.ProgressBar = function (div)
{
		this.div=div;
};

WMEAC.ProgressBar.prototype.isShown = function()
{
		return (this.div.style.display != "none");
};


WMEAC.ProgressBar.prototype.show = function()
{
		this.div.style.display = "block";
};

WMEAC.ProgressBar.prototype.hide = function()
{
		this.div.style.display = "none";
};

WMEAC.ProgressBar.prototype.update = function(value)
{
		if (value==-1)
		{
				this.div.children[0].style.display='none';
				this.div.children[1].style.display='none';
				return;
		}
		this.div.children[0].style.display='block';
		this.div.children[1].style.display='block';
		this.div.children[0].style.width = value+"%";
		this.div.children[1].innerHTML = value+"%";
};
