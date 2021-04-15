﻿using System;
using System.Collections.Generic;
using System.Linq;

namespace Console
{
    public class ConnectionComputer
    {
        public static float[][] ComputeConnections(float[][] relations)
        {
            var n = relations.Length;
            var connections = Util.Create2DArray(n);
            Traverse(n, (x, y) =>
            {
                connections[x][y] = (float)Math.Sqrt(relations[x][y] * relations[y][x]);
            });
            return connections;
        }

        public static (int x, int y, float strength)[] OrderByDecreasingStrength(float[][] connections)
        {
            var res = new List<(int x, int y, float strength)>();
            var n = connections.Length;
            Traverse(n, (x, y) =>
            {
                var strength = connections[x][y];
                if (strength > 0)
                    res.Add((x, y, strength));
            });
            return res.OrderByDescending(a => a.strength).ToArray();
        }

        private static void Traverse(int n, Action<int, int> action)
        {
            if (n > 1)
                for (var x = 1; x < n; x++)
                    for (var y = 0; y < x; y++)
                        action(x, y);
        }
    }
}