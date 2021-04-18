using System;
using System.Linq;

namespace Netocracy.Console.Business
{
    public class Matrix
    {
        private float[][] _elements;

        public Matrix(int size) => _elements = Enumerable.Range(0, size).Select(x => new float[size]).ToArray();

        public Matrix(float[][] elements) => _elements = elements;

        public int Size => _elements.Length;

        public float this[int x, int y]
        {
            get => _elements[x][y];
            set => _elements[x][y] = value;
        }

        public void Add(Matrix matrix)
        {
            for (var x = 0; x < Size; x++)
                for (var y = 0; y < Size; y++)
                    _elements[x][y] = _elements[x][y] + matrix[x, y];
        }

        public float[] ScaledSlice(int x, float scale) => _elements[x].Select(el => el * scale).ToArray();

        public Matrix Clone() => new(_elements.Select(slice => slice.Clone() as float[]).ToArray());

        public void TruncateLower()
        {
            for (var x = 0; x < Size; x++)
                for (var y = 0; y < Size; y++)
                    this[x, y] = Math.Max(0, this[x, y]);
        }

        public void Clear() {
            for (var x = 0; x < Size; x++)
                for (var y = 0; y < Size; y++)
                    this[x, y] = 0;
        }
    }
}