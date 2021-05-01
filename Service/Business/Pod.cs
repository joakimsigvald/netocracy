using System.Collections.Generic;

namespace Netocracy.Console.Business
{
    public class Pod
    {
        public int Id { get; set; }
        public List<Peer> Peers { get; set; }
    }
}