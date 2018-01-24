function __contains__ (element) {
    return this.__target__.has (element);
}

function __dgetitem__ (aKey) {
    return this.get (aKey);
}

function __dsetitem__ (aKey, aValue) {
    this.set (aKey, aValue);
}

function __del__ (aKey) {
    return this.delete (aKey);
}

function __clear__ () {
    this.__target__.clear ()
}

function __pop__ (aKey, aDefault) {
    var result = this.__target__.get (aKey);
    if (result != undefined) {
        this.__target__.delete (aKey);
        return result;
    } else {
        // Identify check because user could pass None
        if (aDefault === undefined) {
            throw KeyError (aKey, new Error());
        }
    }
    return aDefault;
}

function __popitem__ (last) {
    if (this.size == 0) {
        throw KeyError ("popitem(): dictionary is empty", new Error ());
    }
    if (last === undefined) last = true;
    var idx = last ? this.size - 1 : 0
    var aKey = Array.from (this.__target__.keys ()) [idx]
    var result = tuple ([aKey, this.__target__.get (aKey)]);
    this.__target__.delete (aKey);
    return result;
}

function __keys__ () {
    var keys = [];
    for (let key of this.__target__.keys ()) {
        keys.push (key);
    }
    return keys;
}

function __items__ () {
    var items = [];
    for (let entry of this.__target__.entries ()) {
        items.push (entry);
    }
    return items;
}

function __values__ () {
    var values = [];
    for (let value of this.__target__.values ()) {
        values.push (value);
    }
    return values;
}

function __repr__ () {
    if (this.__target__.size == 0) return 'OrderedDict()';
    var result = 'OrderedDict([';
    var comma = false;
    for (let [key, value] of this.__target__.entries ()) {
        if (typeof key == 'number') {
            var attribRepr = key;                // If key can be interpreted as numerical, we make it numerical
        }                                           // So we accept that '1' is misrepresented as 1
        else {
            var attribRepr = '\'' + key + '\'';  // Alpha key in dict
        }

        if (comma) {
            result += ', ';
        }
        else {
            comma = true;
        }
        result += '(' + attribRepr + ', ' + repr (value) + ')';
    }
    result += '])';
    return result;
}


function OrderedDict (objectOrPairs) {

    var createInstance = function (target) {
        var proxy = new Proxy (target, {
            get: function (target, name) {
                var result = target [name];
                if (result == undefined) {  // Target doesn't have attribute named name
                    return target.__getattr__ (name);
                }
                else {
                    return result;
                }
            },
            set: function (target, name, value) {
                target.__setattr__ (name, value);
                return true;
            },
            deleteProperty: function (target, property) {
                return target.py_del (property);
            }
        });
        __setProperty__ (proxy, '__target__', {value: target, enumerable: false, writable: true});
        return proxy;
    };

    var instance = createInstance(new Map());

    if (!objectOrPairs || objectOrPairs instanceof Array) { // It's undefined or an array of pairs
        //instance = createInstance({});
        if (objectOrPairs) {
            for (var index = 0; index < objectOrPairs.length; index++) {
                var pair = objectOrPairs [index];
                if ( !(pair instanceof Array) || pair.length != 2) {
                    throw ValueError(
                        "dict update sequence element #" + index +
                        " has length " + pair.length +
                        "; 2 is required", new Error());
                }
                var key = pair [0];
                var val = pair [1];
                if (!(objectOrPairs instanceof Array) && objectOrPairs instanceof Object) {
                     // User can potentially pass in an object
                     // that has a hierarchy of objects. This
                     // checks to make sure that these objects
                     // get converted to dict objects instead of
                     // leaving them as js objects.

                     if (!isinstance (objectOrPairs, [dict, OrderedDict])) {
                         val = OrderedDict (val);
                     }
                }
                instance.__target__.set (key, val);
            }
        }
    }
    else {
        if (isinstance (objectOrPairs, [dict, OrderedDict])) {
            // Passed object is a dict already so we need to be a little careful
            // N.B. - this is a shallow copy per python std - so
            // it is assumed that children have already become
            // python objects at some point.

            var aKeys = objectOrPairs.py_keys ();
            var len = aKeys.length;
            for (var index = 0; index < len; index++ ) {
                var key = aKeys [index];
                instance.__target__.set (key, objectOrPairs [key]);
            }
        } else if (objectOrPairs instanceof Object) {
            // Passed object is a JavaScript object but not yet a dict
            for (var key in objectOrPairs) {
                if (objectOrPairs.hasOwnProperty (key)) {
                    instance.__target__.set (key, objectOrPairs [key]);
                }
            }
        } else {
            // We have already covered Array so this indicates
            // that the passed object is not a js object - i.e.
            // it is an int or a string, which is invalid.

            throw ValueError ("Invalid type of object for dict creation", new Error ());
        }
    }

    // Trancrypt interprets e.g. {aKey: 'aValue'} as a Python dict literal rather than a JavaScript object literal
    // So dict literals rather than bare Object literals will be passed to JavaScript libraries
    // Some JavaScript libraries call all enumerable callable properties of an object that's passed to them
    // So the properties of a dict should be non-enumerable
    __setProperty__ (instance, '__class__', {value: OrderedDict, enumerable: false, writable: true});
    __setProperty__ (instance, '__contains__', {value: __contains__, enumerable: false});
    __setProperty__ (instance, 'py_keys', {value: __keys__, enumerable: false});
    __setProperty__ (instance, '__iter__', {value: function () {new __PyIterator__ (this.py_keys ());}, enumerable: false});
    __setProperty__ (instance, Symbol.iterator, {value: function () {new __JsIterator__ (this.py_keys ());}, enumerable: false});
    __setProperty__ (instance, 'py_items', {value: __items__, enumerable: false});
    __setProperty__ (instance, 'py_del', {value: __del__, enumerable: false});
    __setProperty__ (instance, 'py_clear', {value: __clear__, enumerable: false});
    __setProperty__ (instance, 'py_get', {value: __getdefault__, enumerable: false});
    __setProperty__ (instance, 'py_setdefault', {value: __setdefault__, enumerable: false});
    __setProperty__ (instance, 'py_pop', {value: __pop__, enumerable: false});
    __setProperty__ (instance, 'py_popitem', {value: __popitem__, enumerable: false});
    __setProperty__ (instance, 'py_update', {value: __update__, enumerable: false});
    __setProperty__ (instance, 'py_values', {value: __values__, enumerable: false});
    __setProperty__ (instance, '__repr__', {value: __repr__, enumerable: false});
    __setProperty__ (instance, '__getitem__', {value: __dgetitem__, enumerable: false});    // Needed since compound keys necessarily
    __setProperty__ (instance, '__setitem__', {value: __dsetitem__, enumerable: false});    // trigger overloading to deal with slices
    __setProperty__ (instance, '__getattr__', {value: __dgetitem__, enumerable: false});    // Needed since compound keys necessarily
    __setProperty__ (instance, '__setattr__', {value: __dsetitem__, enumerable: false});    // trigger overloading to deal with slices
    return instance;
}

__all__.OrderedDict = OrderedDict;
OrderedDict.__name__ = 'OrderedDict';
OrderedDict.__bases__ = [dict];