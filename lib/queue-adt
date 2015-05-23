/*!
* queue-adt
* v0.1.2 - 2014-08-03
* https://github.com/pasangsherpa/queue-adt
* (c) Pasang Sherpa <pgyalzen@gmail.com> (https://github.com/pasangsherpa)
* MIT License
*/
(function() {
    'use strict';
    var Queue = function(initialCapacity) {
        var _initialCapacity = initialCapacity || Infinity;
        var _elements = [];

        function enqueue(element) {
            if (size() === _initialCapacity) {
                throw new Error('enqueue(): Queue is full.');
            }
            return _elements.push(element);
        }

        function dequeue() {
            if (isEmpty()) {
                throw new Error('dequeue(): Queue is empty.');
            }
            return _elements.shift();
        }

        function first() {
            if (isEmpty()) {
                throw new Error('first(): Queue is empty.');
            }
            return _elements[0];
        }

        function isEmpty() {
            return size() === 0;
        }

        function size() {
            return _elements.length;
        }

        function empty() {
            while (_elements.length) {
                _elements.pop();
            }
            return _elements.length;
        }

        function Iterator() {
            var counter = 0;

            function hasNext() {
                return _elements.length !== counter;
            }

            function next() {
                if (!hasNext()) {
                    throw new Error('next(): No such element.');
                }
                return _elements[counter++];
            }
            return {
                hasNext: hasNext,
                next: next
            };
        }

        return {
            enqueue: enqueue,
            dequeue: dequeue,
            first: first,
            isEmpty: isEmpty,
            size: size,
            empty: empty,
            iterator: new Iterator()
        };
    };

    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Queue;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Queue;
    } else {
        window.Queue = Queue;
    }
})();
