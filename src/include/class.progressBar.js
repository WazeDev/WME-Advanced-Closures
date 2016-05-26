WMEAC.ProgressBar = function (id)
{
    this.id=id;
    
    this.divpbi = WMEAC.createElement({type: 'div', id: id, className: id});
    var elt = WMEAC.createElement({type: 'div', id: 'wmeac-progressBar'});
    elt.style.width="100%";
    elt.style.display="none";
    elt.innerHTML='<div class="wmeac-progressBarBG"></div><span class="wmeac-progressBarFG">100%</span>';
    this.divpbi.appendChild(elt);
    
    
    elt = WMEAC.createElement({type: 'div', id: 'wmeac-progressBar-info'});
    //elt.innerHTML="&nbsp;";
    this.divpbi.appendChild(elt);

    this.isShown = function () {
        return (this.divpbi.style.display != "none");
    };
    this.show = function(toShow)
    {
        this.divpbi.style.display = (toShow?"block":"none");
    };
    
    this.update = function(value)
    {
        if (value==-1)
        {
            this.divpbi.children[0].style.display='none';
            this.divpbi.children[1].style.display='none';
            return;
        }
        value = Math.round(value);
        this.divpbi.children[0].style.display='block';
        this.divpbi.children[1].style.display='block';
        this.divpbi.children[0].children[0].style.width = value+"%";
        this.divpbi.children[0].children[1].innerHTML = value+"%";
    };
    
    this.info = function(text)
    {
        this.divpbi.children[1].innerHTML=text;
    };
};


