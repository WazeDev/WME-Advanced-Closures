
WMEAC.inScreenUpdatableArea = function (xy)
{
		for (var a=0; a<WMEAC.wazeModel.userAreas.additionalInfo.length; a++)
		{
				for (var c=0; c<WMEAC.wazeModel.userAreas.additionalInfo[a].geometry.components.length; c++)
				{
						if (WMEAC.wazeModel.userAreas.additionalInfo[a].geometry.components[c].containsPoint(xy))
								return true;
				}
		}
		return false;
};

