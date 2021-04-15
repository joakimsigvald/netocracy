using System;
using System.Linq;

namespace Console
{
    public class RelationComputer
    {
        private readonly int _iterations;

        public RelationComputer(int iterations) => _iterations = iterations;

        public float[][] ComputeRelations(Individual[] individuals)
        {
            var n = individuals.Length;
            var generation = GetTrust(individuals);
            var relations = generation.Select(row => row).ToArray();
            var friendships = individuals.Select(d =>
                d.Peers.Where(p => p.Trust > 0)
                .Select(f => (index: f.Index, weight: f.Trust / 2))
                .ToArray()).ToArray();
            for (var gen = 1; gen < _iterations; gen++)
            {
                generation = ComputeNextGeneration(friendships, generation);
                AddMatrix(relations, generation);
            }
            TruncateLower(relations);
            return relations;

            void TruncateLower(float[][] relations)
            {
                for (var x = 0; x < n; x++)
                    for (var y = 0; y < n; y++)
                        relations[x][y] = Math.Max(0, relations[x][y]);
            }

            float[][] ComputeNextGeneration((int index, float trust)[][] friendships, float[][] currentGen)
            {
                return friendships.Select((friends, x) => ComputeNextIndividualRelations(currentGen, friends, x)).ToArray();
            }

            float[] ComputeNextIndividualRelations(float[][] currentGen, (int index, float weight)[] friends, int x)
            {
                var weightedTrusts = friends.Select(f => Scale(currentGen[f.index], f.weight));
                return Enumerable.Range(0, n).Select(y => y == x ? 0 : weightedTrusts.Sum(wt => wt[y])).ToArray();
            }

            void AddMatrix(float[][] first, float[][] second)
            {
                for (var x = 0; x < n; x++)
                {
                    for (var y = 0; y < n; y++)
                    {
                        first[x][y] = first[x][y] + second[x][y];
                    }
                }
            }

            float[] Scale(float[] arr, float weight) => arr.Select(v => v * weight).ToArray();
        }

        private static float[][] GetTrust(Individual[] individuals)
        {
            var arr = Util.Create2DArray(individuals.Length);
            foreach (var ind in individuals)
                foreach (var peer in ind.Peers)
                    arr[ind.Index][peer.Index] = peer.Trust;
            return arr;
        }
    }
}