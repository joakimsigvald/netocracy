using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Netocracy.Console.Business
{
    public class RelationComputer
    {
        private readonly int _iterations;
        private const int _batchSize = 40;

        public RelationComputer(int iterations) => _iterations = iterations;

        public async Task<Matrix> ComputeRelations(Individual[] individuals)
        {
            var relations = GetTrust(individuals);
            var currentGen = relations.Clone();
            var nextGen = new Matrix(currentGen.Size);
            var friendships = individuals.Select(d =>
                d.Peers.Where(p => p.Trust > 0).ToArray()).ToArray();
            for (var gen = 1; gen < _iterations; gen++)
            {
                await ComputeNextGeneration(friendships, currentGen, nextGen);
                var tmp = nextGen;
                nextGen = currentGen;
                currentGen = tmp;
                relations.Add(currentGen);
            }
            relations.TruncateLower();
            return relations;
        }

        private static async Task ComputeNextGeneration(Peer[][] friendships, Matrix currentGen, Matrix nextGen)
        {
            var tasks = GenerateBatches()
                .Select(b => new Action(() => RunBatch(b)))
                .Select(a => Task.Run(a)).ToArray();
            await Task.WhenAll(tasks);

            IEnumerable<Batch> GenerateBatches()
                => Enumerable.Range(0, 1 + (currentGen.Size - 1) / _batchSize)
                    .Select(GenerateBatch);

            Batch GenerateBatch(int i)
                => new()
                {
                    FromX = i * _batchSize,
                    ToX = Math.Min(friendships.Length, (i + 1) * _batchSize),
                    CurrentGen = currentGen,
                    Friendships = friendships,
                    NextGen = nextGen
                };
        }

        private static void RunBatch(Batch batch)
        {
            for (var x = batch.FromX; x < batch.ToX; x++)
            {
                var friends = batch.Friendships[x];
                ComputeNextIndividualRelations(batch.CurrentGen, batch.NextGen, friends, x);
            }
        }

        private static void ComputeNextIndividualRelations(Matrix currentGen, Matrix nextGen, Peer[] friends, int x)
        {
            var friendsTrusts = friends.Select(f => currentGen.ScaledSlice(f.Index, f.Trust)).ToArray();
            for (var y = 0; y < currentGen.Size; y++)
                if (x != y)
                    nextGen[x, y] = friendsTrusts.Sum(ft => ft[y]);
        }

        private static Matrix GetTrust(Individual[] individuals)
        {
            var m = new Matrix(individuals.Length);
            for (var x = 0; x < individuals.Length; x++) {
                var ind = individuals[x];
                foreach (var peer in ind.Peers)
                    m[x, peer.Index] = peer.Trust;
            }
            return m;
        }
    }
}