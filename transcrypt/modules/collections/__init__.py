from org.transcrypt.stubs.browser import __pragma__, __new__

# __pragma__('skip')
Map = Array = Object = 0
# __pragma__('noskip')


class OrderedDict:

    __bases__ = [dict]

    def __init__(self, items=None):
        self._map = __new__ (Map ())
        if items:
            if isinstance(items, object):
                for key in Object.js_keys (items):
                    if items.hasOwnProperty (key):
                        self._map.set (key, items [key])

    __pragma__('jscall')
    def __getattr__(self, item):
        return self._map.js_get (item)

    def __setattr__(self, item, value):
        self._map.set (item, value)
    __pragma__('nojscall')

    def __contains__(self, item):
        return self._map.has (item)

    def __delattr__(self, item):
        return self._map.delete (item)

    def items(self):
        return [entry for entry in self._map.entries ()]

    def keys(self):
        return [key for key in self._map.js_keys ()]

    def values(self):
        return [val for val in self._map.js_values ()]

    def clear(self):
        self._map.js_clear ()

    __pragma__('jscall')
    def pop(self, item, default=None):
        result = self._map.js_get (item)
        if result:
            self._map.delete (item)
            return result
        else:
            if not default:
                raise KeyError ()
            else:
                return default

    def popitem(self, last=True):
        if self._map.size == 0:
            raise KeyError ('popitem(): dictionary is empty')
        idx = self._map.size - 1 if last else 0
        key = list (self._map.js_keys ()) [idx]
        result = key, self._map.js_get (key)
        self._map.delete (key)
        return result
    __pragma__('nojscall')

    def update(self, items):
        for k in items.keys ():
            self._map.set (k, items [k])

    __pragma__('jscall')
    def __repr__(self):
        if self._map.size == 0:
            return 'OrderedDict()'
        else:
            result = 'OrderedDict(['
            comma = False
            for key, value in self._map.entries ():
                keyRepr = "'" + key + "'" if type (key) == str else key
                if comma:
                    result += ', '
                else:
                    comma = True
                result += '(' + keyRepr + ', ' + repr (value) + ')'
            result += '])'
            return result
    __pragma__('nojscall')
