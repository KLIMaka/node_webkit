define(['stl'], function(STL){

	function Sector(sector) {
		this.modelSector = sector;
	};

	Sector.prototype = {

		build : function(polyBuilder) {
			var segs = this.modelSector.getOrientedSegments();
			var floorPoly = [];
			var ceilPoly = [];
			var wallIdxs = [];
			var self = this;
			STL.apply(segs.begin(), segs.end(), function(seg){
				var sx = seg.getStart().x();
				var sy = seg.getStart().y();
				var ex = seg.getEnd().x();
				var ey = seg.getEnd().y();
				var ceil = self.modelSector.getCeil();
				var floor = self.modelSector.getFloor();

				floorPoly.push([sx, sy, floor]);
				ceilPoly.push([sx, sy, ceil]);

				if (seg.getBack() == null) {
					wallIdxs.push(polyBuilder.add([
						[sx, sy, ceil],
						[ex, ey, ceil],
						[ex, ey, floor],
						[sx, sy, floor],
					]));
				} else {
					var back = seg.getBack();
					if (ceil > back.getCeil()) {
						var backCeil = back.getCeil();
						wallIdxs.push(polyBuilder.add([
							[sx, sy, ceil],
							[ex, ey, ceil],
							[ex, ey, backCeil],
							[sx, sy, backCeil],
						]));	
					}
					if (floor < back.getFloor()) {
						var backFloor = back.getFloor();
						wallIdxs.push(polyBuilder.add([
							[sx, sy, floor],
							[ex, ey, floor],
							[ex, ey, backFloor],
							[sx, sy, backFloor],
						]));	
					}
				}
			});

			this.wallIdxs = wallIdxs;
			this.floorIdxs = polyBuilder.add(floorPoly);
			this.ceilIdxs = polyBuilder.add(ceilPoly.reverse());
		},
	}

});