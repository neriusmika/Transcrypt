from org.transcrypt.stubs.browser import __pragma__, __new__

# __pragma__('skip')
Map = Array = Object = 0
# __pragma__('noskip')


class OrderedDict:

    __bases__ = [dict]

    def __init__(self, items=None):
        self.__map__ = __new__ (Map ())
        if items:
            if isinstance(items, object):
                for key in Object.js_keys (items):
                    if items.hasOwnProperty (key):
                        self.__map__.set (key, items [key])

    __pragma__('jscall')
    def __getattr__(self, item):
        return self.__map__.js_get (item)

    def __setattr__(self, item, value):
        self.__map__.set (item, value)

    def __contains__(self, item):
        return self.__map__.has (item)

    def __delattr__(self, item):
        return self.__map__.delete (item)

    def items(self):
        return [entry for entry in self.__map__.entries ()]

    def keys(self):
        return [key for key in self.__map__.js_keys ()]

    def values(self):
        return [val for val in self.__map__.js_values ()]

    def clear(self):
        self.__map__.js_clear ()

    def pop(self, item, default=None):
        result = self.__map__.js_get (item)
        if result:
            self.__map__.delete (item)
            return result
        else:
            if not default:
                raise KeyError ()
            else:
                return default

    def popitem(self, last=True):
        if self.__map__.size == 0:
            raise KeyError ('popitem(): dictionary is empty')
        idx = self.__map__.size - 1 if last else 0
        key = list (self.__map__.js_keys ()) [idx]
        result = key, self.__map__.js_get (key)
        self.__map__.delete (key)
        return result

    def update(self, items):
        for k in items.keys ():
            self.__map__.set (k, items [k])

    def __repr__(self):
        if self.__map__.size == 0:
            return 'OrderedDict()'
        else:
            result = 'OrderedDict(['
            comma = False
            for key, value in self.__map__.entries ():
                keyRepr = "'" + key + "'" if type (key) == str else key
                if comma:
                    result += ', '
                else:
                    comma = True
                result += '(' + keyRepr + ', ' + repr (value) + ')'
            result += '])'
            return result
    __pragma__('nojscall')
