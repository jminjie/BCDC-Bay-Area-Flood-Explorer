define(function() {
    return function(coords) {
        var sumX = 0, 
            sumY = 0,
            signedArea = 0, 
            i = 0,
            c0 = coords[i], 
            c1;
        while(i < coords.length) {
            c1 = ++i === coords.length ? coords[0] : coords[i];
            var sa = (c0[0]*c1[1] - c1[0]*c0[1]);
            sumX += (c0[0] + c1[0])*sa;
            sumY += (c0[1] + c1[1])*sa;
            signedArea += sa;
            c0 = c1;
        }
        // technically half of sum then applied to each x/y sum as SUM/6A but we're simplifing
        signedArea *= 3.0;
        return [sumX/signedArea, sumY/signedArea];
    };
});