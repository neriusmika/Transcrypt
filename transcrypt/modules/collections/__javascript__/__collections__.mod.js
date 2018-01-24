function __dsetitem__ (aKey, aValue) {
    this [aKey] = aValue;
    var idx = this.__order__.indexOf (aKey);
    if (idx < 0)
        this.__order__.push (aKey);
}

function __del__ (aKey) {
    delete this [aKey];
    this.__order__.splice(this.__order__.indexOf (aKey), 1);
}

function __clear__ () {
    var len = this.__order__.length;
    for (var i = 0; i < len; ++i) {
        delete this [this.__order__ [i]];
    }
    this.__order__ = [];
}

function __pop__ (aKey, aDefault) {
    var result = this [aKey];
    if (result != undefined) {
        delete this [aKey];
        this.__order__.splice (this.__order__.indexOf (aKey), 1);
        return result;
    } else {
        // Identify check because user could pass None
        if ( aDefault === undefined ) {
            throw KeyError (aKey, new Error());
        }
    }
    return aDefault;
}

function __popitem__ (last) {
    if (typeof (last) === 'undefined') last = true;
    var idx = last ? this.__order__.length - 1 : 0

    var aKey = Object.keys (this) [idx];
    if (aKey == null) {
        throw KeyError ("popitem(): dictionary is empty", new Error ());
    }
    var result = tuple ([aKey, this [aKey]]);
    delete this [aKey];
    this.__order__.splice (idx, 1);
    return result;
}

function __keys__ () {
    var keys = [], len = this.__order__.length;
    for (var i = 0; i < len; ++i) {
        if (!__specialattrib__ (this.__order__ [i])) {
            keys.push (this.__order__ [i]);
        }
    }
    return keys;
}

function __items__ () {
    var items = [], len = this.__order__.length;
    for (var i = 0; i < len; ++i) {
        if (!__specialattrib__ (this.__order__ [i])) {
            items.push ([this.__order__ [i], this [this.__order__ [i]]]);
        }
    }
    return items;
}

function __values__ () {
    var values = [], len = this.__order__.length;
    for (var i = 0; i < len; ++i) {
        if (!__specialattrib__ (this.__order__ [i])) {
            values.push (this [this.__order__ [i]]);
        }
    }
    return values;
}

function __repr__ () {
    var result = 'OrderedDict([';
    var comma = false, len = this.__order__.length;
    for (var i = 0; i < len; ++i) {
        if (!__specialattrib__ (this.__order__ [i])) {
            if (this.__order__ [i].isnumeric ()) {
                var attribRepr = this.__order__ [i];                // If key can be interpreted as numerical, we make it numerical
            }                                           // So we accept that '1' is misrepresented as 1
            else {
                var attribRepr = '\'' + this.__order__ [i] + '\'';  // Alpha key in dict
            }

            if (comma) {
                result += ', ';
            }
            else {
                comma = true;
            }
            result += '(' + attribRepr + ', ' + repr (this [this.__order__ [i]]) + ')';
        }
    }
    result += '])';
    return result;
}


function OrderedDict (objectOrPairs) {

    var createInstance = function (target) {
        var proxy = new Proxy (target, {
            set: function (target, name, value) {
                target.__setattr__(name, value);
                return true;
            }
        });
        __setProperty__ (proxy, '__order__', {value: [], enumerable: false, writable: true});
        return proxy;
    };

    var instance;

    if (!objectOrPairs || objectOrPairs instanceof Array) { // It's undefined or an array of pairs
        instance = createInstance({});
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
                instance [key] = val;
            }
        }
    }
    else {
        if (isinstance (objectOrPairs, [dict, OrderedDict])) {
            // Passed object is a dict already so we need to be a little careful
            // N.B. - this is a shallow copy per python std - so
            // it is assumed that children have already become
            // python objects at some point.
            instance = createInstance({});

            var aKeys = objectOrPairs.py_keys ();
            var len = aKeys.length;
            for (var index = 0; index < len; index++ ) {
                var key = aKeys [index];
                instance [key] = objectOrPairs [key];
            }
        } else if (objectOrPairs instanceof Object) {
            // Passed object is a JavaScript object but not yet a dict, don't copy it
            instance = createInstance(objectOrPairs);
            // create keys order
            for (var attrib in objectOrPairs) {
                if (objectOrPairs.hasOwnProperty (attrib)) {
                    instance.__order__.push (attrib);
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
    // __setProperty__ (instance, '__getattr__', {value: __dgetitem__, enumerable: false});    // Needed since compound keys necessarily
    __setProperty__ (instance, '__setattr__', {value: __dsetitem__, enumerable: false});    // trigger overloading to deal with slices
    return instance;
}

__all__.OrderedDict = OrderedDict;
OrderedDict.__name__ = 'OrderedDict';
OrderedDict.__bases__ = [dict];