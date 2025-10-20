define(function() {
    
    function Matrix(param) {
        this.__length    = 0;
        this.__dimSizes  = [];
        this.__dimValues = [];
        this.__values    = [];
        // begin various construction options
        if(!Array.isArray(param)) {
            // number is input, construct by number of dimensions
            if(isNaN(param)) throw "Bad construction parameter";
            this.__length = param;
            if(this.__length <= 0) throw "Construction by illegal number of dimensions";
            var nextValueArray = this.__values;
            for(var d = 0; d < this.__length; ) {
                this.__dimSizes.push(0);
                this.__dimValues.push([]);
                if(++d < this.__length) {
                    nextValueArray.push([]);
                    nextValueArray = nextValueArray[0];
                }
            }
        } else if(!Array.isArray(param[0])) {
            // single-depth array is input, construct as list of dimension lengths
            this.__length = param.length;
            if(this.__length <= 0) throw "Construction by illegal number of dimensions";
            var values = this.__values;
            for(var d = 0; d < this.__length; ++d) {
                if(isNaN(param[d]) || param[d] < 1) throw "Construction by illegal dimension size";
                var dimSize = parseInt(param[d]);
                this.__dimSizes.push(dimSize);
                this.__dimValues.push(Array.apply(null, new Array(dimSize)));
                // add to flattened values
                var lastDim = d+1 === this.__length, 
                    newValues = [], 
                    loopEnd = !d ? 1 : values.length;
                for(var i = 0; i < loopEnd; ++i) {
                    for(var j = 0; j < dimSize; ++j) {
                        var newArr = lastDim ? undefined : [];
                        if(d) {
                            values[i].push(newArr);
                        } else {
                            values.push(newArr);
                        }
                        if(!lastDim) newValues.push(newArr);
                    }
                }
                values = newValues;
            }
        } else {
            // array of array, construct as the given matrix
            var readArr = param, 
                readFlatArr = param, 
                writeFlatArr = this.__values;
            // first loop to gather dimensions and format value array (and flat write array)
            while(true) {
                // init dimension
                var dimSize = readArr.length;
                this.__dimSizes.push(dimSize);
                this.__dimValues.push(Array.apply(null, new Array(dimSize)));
                // prep next read level and check if last level
                readArr = readArr[0];
                var breakLoop = !Array.isArray(readArr);
                // expand value array
                if(!this.__length) {
                    // for first, init write array
                    for(var i = 0; i < dimSize; ++i) writeFlatArr.push([]);
                } else if(!breakLoop) {
                    // next level flat write array (skip for last though, we want to stop at last array level)
                    var newWriteFlatArr = [];
                    for(var i = 0; i < writeFlatArr.length; ++i) {
                        for(var j = 0; j < dimSize; ++j) {
                            // pushing by same reference so flat array will write to formatted array
                            var newArr = [];
                            writeFlatArr[i].push(newArr);
                            newWriteFlatArr.push(newArr);
                        }
                    }
                    writeFlatArr = newWriteFlatArr;
                }
                // increase num of dimensions
                ++this.__length;
                // break when no longer nested array
                if(breakLoop) break;
            };
            // now flatten read array
            var readFlatArr = param;
            for(var d = 0; d < this.__length-1; ++d) {
                var newReadFlatArr  = [];
                for(var i = 0; i < readFlatArr.length; ++i) {
                    // check consistent size
                    if(readFlatArr[i].length !== this.__dimSizes[d+1]) throw "Malformed array";
                    // flatten next read level
                    for(var j = 0; j < readFlatArr[i].length; ++j) newReadFlatArr.push(readFlatArr[i][j]);
                }
                readFlatArr  = newReadFlatArr;
            }
            // finally, copy values
            var a = 0, c = 0, lastDimSize = this.__dimSizes[this.__dimSizes.length-1];
            for(var i = 0; i < readFlatArr.length; ++i) {
                writeFlatArr[a].push(readFlatArr[i]);
                if(++c === lastDimSize) { ++a; c = 0; }
            }
        }
    }
    
    
    //********************************************************************************************************
    // Get properties
    //********************************************************************************************************
    Matrix.prototype.length = function() {
        return this.__length;
    };
    
    Matrix.prototype.size = function() {
        return this.__dimSizes.reduce(function(a,x){a+=x;});
    };
    
    Matrix.prototype.dimensions = function() {
        return this.__dimSizes.slice();
    };
    
    Matrix.prototype.dims = function() {
        return this.dimensions();
    };
    
    
    //********************************************************************************************************
    // Dimension functions
    //********************************************************************************************************
    Matrix.prototype.setDimensionValue = function(dimension, index, value) {
        if(value !== undefined && this.getDimensionIndex(dimension, value) >= 0) throw "Value already exists.";
        this.__dimValues[dimension][index] = value;
        return this;
    };
    
    Matrix.prototype.increaseDimension = function(dimension, dimensionValue) {
        if(dimensionValue !== undefined && this.getDimensionIndex(dimension, dimensionValue) >= 0) throw "Value already exists.";
        this.__dimValues[dimension].push(dimensionValue);
        ++this.__dimSizes[dimension];
        this.__extend(dimension, this.__values, 0);
        return this;
    };
    
    Matrix.prototype.__extend = function(dimension, valueArray, depth) {
        if(depth+1 === this.__length) {
            // this is at the last level
            while(valueArray.length < this.__dimSizes[depth]) {
                valueArray.push(undefined);
            }
        } else {
            // selective start if on extending dimension
            var startIndex = depth === dimension ? valueArray.length-1 : 0;
            // extend until matching
            while(valueArray.length < this.__dimSizes[depth]) {
                valueArray.push([]);
            };
            var startIndex = depth === dimension ? valueArray.length-1 : 0;
            // dig deeper
            ++depth;
            for(var i = startIndex; i < valueArray.length; ++i) {
                this.__extend(dimension, valueArray[i], depth);
            }
        }
    };
    
    Matrix.prototype.getDimensionValues = function(dimension) {
        return this.__dimValues[dimension].slice();
    };
    
    Matrix.prototype.getDimensionValue = function(dimension, dimensionIndex) {
        return this.__dimValues[dimension][dimensionIndex];
    };
    
    Matrix.prototype.getDimensionIndex = function(dimension, dimensionValue) {
        return this.__dimValues[dimension].indexOf(dimensionValue);
    };
    
    
    //********************************************************************************************************
    // Value functions
    //********************************************************************************************************
    Matrix.prototype.getValue = function(dimensionIndices) {
        if(dimensionIndices.length !== this.__length) throw "Incompatible length of indices";
        var value = this.__values;
        for(var i = 0; i < dimensionIndices.length; ++i) {
            value = value[dimensionIndices[i]];
        }
        return value;
    };
    
    Matrix.prototype.setValue = function(dimensionIndices, value) {
        if(dimensionIndices.length !== this.__length) throw "Incompatible length of indices";
        var i = 0,
            valueArray = this.__values;
        while(true) {
            if(i+1 === dimensionIndices.length) {
                valueArray[dimensionIndices[i]] = value;
                break;
            } else {
                valueArray = valueArray[dimensionIndices[i++]];
            }
        }
        return this;
    };
    
    Matrix.prototype.fill = function(value) {
        if(isNaN(value)) throw "Value must be numeric type";
        this.__iterate(function() { return value; });
    };
    
    
    //********************************************************************************************************
    // Array operations
    //********************************************************************************************************
    Matrix.prototype.__iterate = function(operation, values, runningIndices) {
        if(!runningIndices) runningIndices = [];
        if(!values) values = this.__values;
        
        var indexOfIndex = runningIndices.length;
        runningIndices.push(0);
        
        var finalDepth = values.length && !Array.isArray(values[0]);
        for(var i = 0; i < values.length; ++i) {
            runningIndices[indexOfIndex] = i;
            if(finalDepth) {
                var ret = operation(values[i], runningIndices);
                if(ret || ret === 0) values[i] = ret;
            } else {
                this.__iterate(operation, values[i], runningIndices);
            }
        }
        
        runningIndices.pop();
    };
    
    Matrix.prototype.clone = function(suppressValueCopy) {
        var clone = new Matrix(this.__dimSizes);
        for(var d = 0; d < this.__length; ++d) {
            // copy dim values
            for(var i = 0; i < this.__dimValues[d].length; ++i) {
                clone.__dimValues[d][i] = this.__dimValues[d][i];
            }
        }
        // copy values
        if(!suppressValueCopy) {
            this.__iterate(function(val, indices) {
                clone.setValue(indices, val);
            });
        }
        return clone;
    };
    
    Matrix.prototype.copy = function() {
        return this.clone();
    };
    
    Matrix.prototype.add = function(add) {
        var result;
        if(add instanceof Matrix) {
            // check dimension sizes match
            if(this.__length !== add.__length) throw "Matrix addition requires equal dimensions.";
            for(var d = 0; d < this.__length; ++d) {
                if(this.__dimSizes[d] !== add.__dimSizes[d]) throw "Matrix addition requires equal dimensions.";
            }
            // add values one to one
            result = this.clone();
            result.__iterate(function(val, indices) {
                return val+add.getValue(indices);
            });
        } else if(!isNaN(add)) {
            // add scalar to all values
            result = this.clone();
            result.__iterate(function(val) {
                return val+add;
            });
        } else {
            throw "Unsupported type for matrix addition (provide another matrix or scalar).";
        }
        return result;
    };
    
    Matrix.prototype.multiply = function(multiply) {
        var result, 
            isMatrix = multiply instanceof Matrix, 
            isVector = (isMatrix && multiply.__length === 1) || (Array.isArray(multiply) && !isNaN(multiply[0]));
    
        if(isVector) {
            // vector multiplication
            if(this.__length !== 2) throw "Vector product only supported for 2D matrices.";
            var vector = isMatrix ? multiply.__values : multiply;
            if(vector.length !== this.__dimSizes[0]) throw "Incompatible vector size for vector product.";
            
            result = new Matrix([1, this.__dimSizes[1]]);
            result.fill(0);
            this.__iterate(function(val, indices) {
                result.__values[indices[0]] += val*vector[indices[1]];
            });
            
        } else if(isMatrix) {
            // matrix multiplication
            if(this.__length !== 2 || multiply.__length !== 2) throw "Only products of 2D matrices support at the moment.";
            
            if(this.__dimSizes[0] !== multiply.__dimSizes[1]) throw "Incompatible matrix size for matrix product.";
            result = new Matrix([this.__dimSizes[1], multiply.__dimSizes[0]]);
            var self = this;
            result.__iterate(function(val, indices) {
                var sum = 0;
                for(var i = 0; i < self.__dimSizes[0].length; ++i) {
                    sum += self.__values[indices[0]][i] * multiply.__values[i][indices[1]];
                }
                return sum;
            });
            
        } else if(!isNaN(multiply)) {
            // multiply scalar to all values
            result = this.clone();
            result.__iterate(function(val, indices) {
                result.setValue(indices, val*multiply);
            });
            
        } else {
            throw "Unsupported type for matrix multiplcation (provide another matrix, scalar, or single-depth array).";
        }
        
        return result;
    };
    
    Matrix.prototype.product = function(product) {
        return this.multiply(product);
    };
    
    return Matrix;
    
});