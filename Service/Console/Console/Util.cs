using System.Linq;

namespace Console
{
    public static class Util
    {
        public static float[][] Create2DArray(int n)
            => Enumerable.Range(0, n).Select(i => new float[n]).ToArray();
    }
    }
