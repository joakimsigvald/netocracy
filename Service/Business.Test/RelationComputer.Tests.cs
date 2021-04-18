using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Netocracy.Console.Business.Test
{
    public class RelationComputerTests
    {
        [Theory]
        [InlineData(2, 1)]
        [InlineData(3, 1)]
        [InlineData(4, 1)]
        [InlineData(10, 1)]
        public async Task GivenFullyConnectedIndividuals_WhenComputeRelations_TheyAre_1(int count, float strength)
        {
            var individuals = IndividualComputer.GenerateIndividuals(count, count - 1, 0);
            var computer = new RelationComputer(100);
            
            var relations = await computer.ComputeRelations(individuals);
            
            Assert.Equal(count, relations.Size);
            for (var i = 0; i < count; i++)
            {
                Assert.Equal(0, relations[i,i]);
                if (i > 0)
                {
                    Assert.Equal(strength, relations[i,0], 4);
                    Assert.Equal(strength, relations[0,i], 4);
                }
            }
        }
        [Theory]
        [InlineData(3, 1)]
        [InlineData(4, 1)]
        [InlineData(5, 1)]
        [InlineData(10, 1)]
        public async Task GivenCircleOfConnectedIndividuals_WhenComputeRelations_TheyAre_1(int count, float strength)
        {
            var individuals = Enumerable.Range(0, count).Select(i => new Individual {
                Id = i + 1,
                Index = i
            }).ToArray();
            for (var i = 0; i < count; i++) {
                individuals[i].Peers = new[] {
                    new Peer { Index = (i + count - 1) % count, Trust = 1 },
                    new Peer { Index = (i + 1) % count, Trust = 1 }
                }.ToList();
            }
            individuals = individuals.Select(IndividualComputer.Calibrate).ToArray();
            var computer = new RelationComputer(100);
            
            var relations = await computer.ComputeRelations(individuals);
            
            Assert.Equal(count, relations.Size);
            for (var i = 0; i < count; i++)
            {
                Assert.Equal(strength, relations[i,(i + 1) % count], 2);
                Assert.Equal(strength, relations[(i + 1) % count,i], 2);
            }
        }
    }
}